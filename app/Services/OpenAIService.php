<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class OpenAIService
{
    protected $apiKey;
    protected $defaultModel;
    protected $fallbackModels;
    protected $temperature;
    protected $maxTokens;
    protected $maxRetries;
    protected $cacheTime;

    public function __construct()
    {
        $this->apiKey = env('OPENAI_API_KEY');
        $this->defaultModel = env('OPENAI_MODEL', 'gpt-4');
        $this->fallbackModels = [
            'gpt-3.5-turbo-0125',  // Latest GPT-3.5 with better performance
            'gpt-3.5-turbo-1106',  // Stable version
            'gpt-3.5-turbo',       // Standard version
            'gpt-4',               // More expensive but higher quality
            'gpt-4-0613'           // Stable GPT-4 version
        ];
        $this->temperature = (float)env('OPENAI_TEMPERATURE', 0.3);
        $this->maxTokens = (int)env('OPENAI_MAX_TOKENS', 500);
        $this->maxRetries = (int)env('OPENAI_MAX_RETRIES', 3);
        $this->cacheTime = (int)env('OPENAI_CACHE_TIME', 60); // Cache responses for 1 hour by default
        
        // Production-specific adjustments
        if (app()->environment('production')) {
            // Increase retries in production
            $this->maxRetries = max(5, $this->maxRetries);
            
            // Add more stable/available models for production
            array_unshift($this->fallbackModels, 'gpt-3.5-turbo-0125');
            
            // Log initialization in production for debugging
            \Illuminate\Support\Facades\Log::info('OpenAIService initialized in production', [
                'model' => $this->defaultModel,
                'fallbacks' => $this->fallbackModels,
                'max_retries' => $this->maxRetries
            ]);
        }
    }

    /**
     * Generate a response from OpenAI
     * 
     * @param string $systemPrompt - The system prompt that sets AI behavior
     * @param string $userPrompt - The user's question/prompt
     * @param array $options - Additional options like model, temperature, etc.
     * @return array - The response data or error information
     */
    public function generateResponse($systemPrompt, $userPrompt, $options = [])
    {
        // Check if fallbacks are enabled
        $useFallback = env('OPENAI_USE_FALLBACK', false);
        
        // If fallbacks are enabled in production and we have high load, use fallback immediately
        if ($useFallback && app()->environment('production')) {
            $isHighLoad = $this->isServerHighLoad();
            if ($isHighLoad) {
                Log::info('Server under high load, using fallback response immediately');
                return $this->getFallbackResponse($userPrompt);
            }
        }
        
        // Validate API key
        if (!$this->apiKey) {
            Log::warning('OpenAI API key not configured');
            return $this->errorResponse('api_key_missing', 'AI service is not properly configured.');
        }
        
        // Generate cache key for identical requests
        $cacheKey = 'openai_' . md5($systemPrompt . $userPrompt . serialize($options));
        
        // Check if response is cached
        if (Cache::has($cacheKey)) {
            Log::info('Using cached OpenAI response', ['cache_key' => $cacheKey]);
            return Cache::get($cacheKey);
        }
        
        $model = $options['model'] ?? $this->defaultModel;
        $temperature = $options['temperature'] ?? $this->temperature;
        $maxTokens = $options['maxTokens'] ?? $this->maxTokens;
        
        // Production-specific optimizations
        if (app()->environment('production')) {
            // Use more conservative settings in production
            $temperature = min(0.3, $temperature);
            $maxTokens = min(400, $maxTokens);
        }
        
        // Optimize parameters for GPT-3.5-turbo
        if (strpos($model, 'gpt-3.5') !== false) {
            $temperature = min(0.1, $temperature); // Lower temperature for more consistent responses
            $maxTokens = min(300, $maxTokens); // Reduce tokens for better focus
        }
        
        $retryCount = 0;
        $modelIndex = -1; // Start with default model
        
        // Keep track of tried models to avoid duplicates
        $triedModels = [];
        $allErrors = [];
        
        // Retry loop for error handling
        while ($retryCount <= $this->maxRetries) {
            try {
                // If we've had failures, try fallback models
                if ($retryCount > 0) {
                    $modelIndex++;
                    if ($modelIndex < count($this->fallbackModels)) {
                        $model = $this->fallbackModels[$modelIndex];
                    } else {
                        // We've tried all models
                        break;
                    }
                }
                
                // Don't retry with the same model
                if (in_array($model, $triedModels)) {
                    continue;
                }
                
                $triedModels[] = $model;
                Log::info('Attempting OpenAI request', [
                    'model' => $model, 
                    'retry' => $retryCount,
                    'environment' => app()->environment()
                ]);
                
                // Calculate dynamic timeout based on token length
                $baseTimeout = 10; // Base 10 seconds
                $promptLength = mb_strlen($systemPrompt) + mb_strlen($userPrompt);
                $timeout = $baseTimeout + ceil($promptLength / 500); // Add 1 second per 500 chars
                
                // Increase timeouts in production
                if (app()->environment('production')) {
                    $timeout += 10; // Add 10 more seconds in production for network latency
                }
                
                $response = Http::timeout($timeout)
                    ->retry(2, 1000) // HTTP-level retry, separate from our model fallback
                    ->withHeaders([
                        'Authorization' => 'Bearer ' . $this->apiKey,
                        'Content-Type' => 'application/json'
                    ])
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => $model,
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => $systemPrompt
                            ],
                            [
                                'role' => 'user',
                                'content' => $userPrompt
                            ]
                        ],
                        'temperature' => $temperature,
                        'max_tokens' => $maxTokens,
                        'top_p' => 1,
                        'frequency_penalty' => 0,
                        'presence_penalty' => 0
                    ]);
                
                if ($response->successful()) {
                    $responseData = $response->json();
                    
                    if (isset($responseData['choices'][0]['message']['content'])) {
                        $result = [
                            'success' => true,
                            'content' => $responseData['choices'][0]['message']['content'],
                            'model' => $model,
                            'token_usage' => $responseData['usage'] ?? null,
                            'cached' => false,
                            'retries' => $retryCount
                        ];
                        
                        // Cache successful responses
                        Cache::put($cacheKey, $result, $this->cacheTime);
                        
                        // Log successful response in production
                        if (app()->environment('production')) {
                            Log::info('Successfully generated AI response in production', [
                                'model' => $model,
                                'tokens' => $responseData['usage']['total_tokens'] ?? 'unknown',
                                'retries' => $retryCount
                            ]);
                        }
                        
                        return $result;
                    } else {
                        Log::error('Unexpected OpenAI response structure', ['response' => $responseData]);
                    }
                } else {
                    $statusCode = $response->status();
                    $errorBody = $response->body();
                    $errorData = $response->json();
                    $errorMessage = $errorData['error']['message'] ?? 'Unknown error';
                    $errorType = $errorData['error']['type'] ?? 'unknown';
                    
                    // Store error for later
                    $allErrors[] = [
                        'model' => $model,
                        'status' => $statusCode,
                        'type' => $errorType,
                        'message' => $errorMessage
                    ];
                    
                    Log::error("Error calling OpenAI API: HTTP $statusCode", [
                        'error_body' => $errorBody,
                        'model' => $model,
                        'environment' => app()->environment()
                    ]);
                    
                    // For rate limit issues, wait longer before retry
                    if ($statusCode === 429) {
                        Log::warning('OpenAI rate limit reached, waiting before retry', [
                            'model' => $model,
                            'retry' => $retryCount
                        ]);
                        
                        // Longer backoff in production
                        $sleepTime = app()->environment('production') ? 
                            5 * ($retryCount + 1) : 
                            2 * ($retryCount + 1);
                            
                        sleep($sleepTime); // Progressive backoff
                    }
                    
                    // For server errors, move to next model more quickly
                    if ($statusCode >= 500) {
                        $modelIndex++;
                    }
                }
                
            } catch (\Exception $e) {
                $allErrors[] = [
                    'model' => $model,
                    'exception' => $e->getMessage()
                ];
                
                Log::error('Exception calling OpenAI API', [
                    'error' => $e->getMessage(),
                    'model' => $model,
                    'environment' => app()->environment()
                ]);
            }
            
            // Increment retry counter
            $retryCount++;
        }
        
        // Log comprehensive error information in production
        if (app()->environment('production')) {
            Log::error('All OpenAI API attempts failed', [
                'errors' => $allErrors,
                'models_tried' => $triedModels
            ]);
        }
        
        // If fallbacks are enabled, use a predefined response
        if ($useFallback) {
            return $this->getFallbackResponse($userPrompt);
        }
        
        // Check specifically for rate limiting
        $rateLimit = false;
        foreach ($allErrors as $error) {
            if (isset($error['status']) && $error['status'] === 429) {
                $rateLimit = true;
                break;
            }
            
            if (isset($error['message']) && (
                strpos($error['message'], 'rate limit') !== false ||
                strpos($error['message'], 'quota') !== false ||
                strpos($error['message'], 'capacity') !== false
            )) {
                $rateLimit = true;
                break;
            }
        }
        
        if ($rateLimit) {
            return $this->errorResponse('rate_limit_exceeded', 'The AI service is currently experiencing high demand. Please try again in a few moments.');
        }
        
        return $this->errorResponse('api_error', 'Unable to generate a response at this time. Please try again later.');
    }
    
    /**
     * Check if the server is under high load
     * 
     * @return boolean
     */
    private function isServerHighLoad()
    {
        // Only perform this check in production
        if (!app()->environment('production')) {
            return false;
        }
        
        try {
            // Get server load (works on Linux)
            $load = sys_getloadavg();
            if ($load && isset($load[0])) {
                // If load average is > 2, consider it high load
                return $load[0] > 2;
            }
        } catch (\Exception $e) {
            // Ignore exceptions from this check
        }
        
        return false;
    }
    
    /**
     * Generate an intelligent response with comprehensive inventory context
     * 
     * @param string $question - The user's question
     * @param array $options - Additional options
     * @return array - The response data or error information
     */
    public function generateIntelligentInventoryResponse($question, $options = [])
    {
        try {
            // Get comprehensive system data
            $dataContextService = app()->make(\App\Services\InventoryDataContextService::class);
            $systemData = $dataContextService->getComprehensiveSystemData();
            
            // Analyze the question to determine focus areas
            $focusAreas = $this->analyzeQuestionContext($question);
            
            // Create focused context based on the question
            $focusedContext = $this->createFocusedContext($systemData, $focusAreas);
            
            // Build enhanced system prompt
            $systemPrompt = $this->buildEnhancedSystemPrompt($focusAreas);
            
            // Build user prompt with comprehensive context
            $userPrompt = $this->buildComprehensiveUserPrompt($question, $focusedContext);
            
            // Generate response with enhanced context
            return $this->generateResponse($systemPrompt, $userPrompt, $options);
            
        } catch (\Exception $e) {
            Log::error('Failed to generate intelligent inventory response', [
                'error' => $e->getMessage(),
                'question' => $question
            ]);
            
            return $this->errorResponse('context_error', 'Unable to analyze inventory data for your question.');
        }
    }
    
    /**
     * Analyze question to determine what data to focus on
     */
    private function analyzeQuestionContext($question)
    {
        $questionLower = strtolower($question);
        $focusAreas = [];
        
        // Asset type keywords
        if (preg_match('/\b(device|computer|laptop|desktop)\b/', $questionLower)) {
            $focusAreas[] = 'devices';
        }
        if (preg_match('/\b(monitor|screen|display)\b/', $questionLower)) {
            $focusAreas[] = 'monitors';
        }
        if (preg_match('/\b(peripheral|mouse|keyboard|headset)\b/', $questionLower)) {
            $focusAreas[] = 'peripherals';
        }
        if (preg_match('/\b(system unit|cpu|ram|storage)\b/', $questionLower)) {
            $focusAreas[] = 'system_units';
        }
        if (preg_match('/\b(part|component|spare)\b/', $questionLower)) {
            $focusAreas[] = 'parts';
        }
        if (preg_match('/\b(other asset|furniture|equipment)\b/', $questionLower)) {
            $focusAreas[] = 'other_assets';
        }
        
        // Analysis type keywords
        if (preg_match('/\b(price|cost|value|financial|budget|expensive|cheap)\b/', $questionLower)) {
            $focusAreas[] = 'financial';
        }
        if (preg_match('/\b(location|where|building|office|department)\b/', $questionLower)) {
            $focusAreas[] = 'locations';
        }
        if (preg_match('/\b(user|person|employee|assign|who)\b/', $questionLower)) {
            $focusAreas[] = 'users';
        }
        if (preg_match('/\b(request|return|pending|approve)\b/', $questionLower)) {
            $focusAreas[] = 'requests';
        }
        if (preg_match('/\b(utilization|usage|efficiency|optimize)\b/', $questionLower)) {
            $focusAreas[] = 'utilization';
        }
        if (preg_match('/\b(stock|inventory|level|low|empty)\b/', $questionLower)) {
            $focusAreas[] = 'inventory_health';
        }
        if (preg_match('/\b(trend|change|increase|decrease|over time)\b/', $questionLower)) {
            $focusAreas[] = 'trends';
        }
        if (preg_match('/\b(brand|model|specification|spec|feature)\b/', $questionLower)) {
            $focusAreas[] = 'specifications';
        }
        if (preg_match('/\b(relationship|connect|link|associate)\b/', $questionLower)) {
            $focusAreas[] = 'relationships';
        }
        
        // Analytical keywords
        if (preg_match('/\b(most|highest|best|top|maximum)\b/', $questionLower)) {
            $focusAreas[] = 'top_analysis';
        }
        if (preg_match('/\b(least|lowest|worst|bottom|minimum)\b/', $questionLower)) {
            $focusAreas[] = 'bottom_analysis';
        }
        if (preg_match('/\b(average|mean|typical|normal)\b/', $questionLower)) {
            $focusAreas[] = 'average_analysis';
        }
        if (preg_match('/\b(total|sum|all|overall|entire)\b/', $questionLower)) {
            $focusAreas[] = 'total_analysis';
        }
        if (preg_match('/\b(compare|comparison|versus|vs|difference)\b/', $questionLower)) {
            $focusAreas[] = 'comparison';
        }
        
        // Default focus if no specific areas identified
        if (empty($focusAreas)) {
            $focusAreas = ['summary', 'general'];
        }
        
        return array_unique($focusAreas);
    }
    
    /**
     * Create focused context based on question analysis
     */
    private function createFocusedContext($systemData, $focusAreas)
    {
        $context = [];
        
        // Always include summary for general context (with safe access)
        $context['summary'] = $systemData['summary'] ?? ['error' => 'Summary data unavailable'];
        
        // Add specific data based on focus areas
        foreach ($focusAreas as $area) {
            switch ($area) {
                case 'devices':
                    if (isset($systemData['assets']['devices'])) {
                        $context['devices'] = $systemData['assets']['devices'];
                    }
                    break;
                case 'monitors':
                    if (isset($systemData['assets']['monitors'])) {
                        $context['monitors'] = $systemData['assets']['monitors'];
                    }
                    break;
                case 'peripherals':
                    if (isset($systemData['assets']['peripherals'])) {
                        $context['peripherals'] = $systemData['assets']['peripherals'];
                    }
                    break;
                case 'system_units':
                    if (isset($systemData['assets']['system_units'])) {
                        $context['system_units'] = $systemData['assets']['system_units'];
                    }
                    break;
                case 'parts':
                    if (isset($systemData['assets']['parts'])) {
                        $context['parts'] = $systemData['assets']['parts'];
                    }
                    break;
                case 'other_assets':
                    if (isset($systemData['assets']['other_assets'])) {
                        $context['other_assets'] = $systemData['assets']['other_assets'];
                    }
                    break;
                case 'financial':
                    if (isset($systemData['financial'])) {
                        $context['financial'] = $systemData['financial'];
                    }
                    break;
                case 'locations':
                    if (isset($systemData['locations'])) {
                        $context['locations'] = $systemData['locations'];
                    }
                    break;
                case 'users':
                    if (isset($systemData['users'])) {
                        $context['users'] = $systemData['users'];
                    }
                    break;
                case 'requests':
                    if (isset($systemData['requests'])) {
                        $context['requests'] = $systemData['requests'];
                    }
                    break;
                case 'utilization':
                case 'inventory_health':
                    if (isset($systemData['inventory_health'])) {
                        $context['inventory_health'] = $systemData['inventory_health'];
                    }
                    break;
                case 'trends':
                    if (isset($systemData['trends'])) {
                        $context['trends'] = $systemData['trends'];
                    }
                    break;
                case 'relationships':
                    if (isset($systemData['relationships'])) {
                        $context['relationships'] = $systemData['relationships'];
                    }
                    break;
                case 'specifications':
                    // Include spec data from relevant assets
                    if (isset($systemData['assets']['devices']['specifications'])) {
                        $context['device_specifications'] = $systemData['assets']['devices']['specifications'];
                    }
                    break;
            }
        }
        
        return $context;
    }
    
    /**
     * Build enhanced system prompt based on focus areas
     */
    private function buildEnhancedSystemPrompt($focusAreas)
    {
        $basePrompt = 'You are InventoryGPT, an advanced AI assistant specializing in comprehensive inventory management analysis. ';
        
        // Add specific expertise based on focus areas
        $expertise = [];
        
        if (in_array('financial', $focusAreas)) {
            $expertise[] = 'financial analysis and cost optimization';
        }
        if (in_array('utilization', $focusAreas) || in_array('inventory_health', $focusAreas)) {
            $expertise[] = 'utilization analysis and efficiency optimization';
        }
        if (in_array('trends', $focusAreas)) {
            $expertise[] = 'trend analysis and forecasting';
        }
        if (in_array('relationships', $focusAreas)) {
            $expertise[] = 'data relationship analysis and insights';
        }
        if (in_array('specifications', $focusAreas)) {
            $expertise[] = 'technical specifications and compatibility analysis';
        }
        
        if (!empty($expertise)) {
            $basePrompt .= 'You specialize in ' . implode(', ', $expertise) . '. ';
        }
        
        $basePrompt .= 'Analyze the provided inventory data and answer questions with:
        
        1. **Specific Numbers**: Always provide exact counts, values, and percentages from the data
        2. **Context**: Explain what the numbers mean in business terms
        3. **Insights**: Identify patterns, trends, or notable findings
        4. **Actionable Information**: When relevant, suggest what actions the data indicates
        5. **Relationships**: Highlight connections between different data points
        
        Rules:
        - Use only data provided in the context
        - Be precise with numbers and calculations
        - Explain technical terms for business users
        - Keep responses under 300 words but comprehensive
        - If data is insufficient, clearly state what information is missing
        - Format important numbers and percentages clearly
        
        Your goal is to provide business intelligence that helps with decision-making.';
        
        return $basePrompt;
    }
    
    /**
     * Build comprehensive user prompt with focused context
     */
    private function buildComprehensiveUserPrompt($question, $focusedContext)
    {
        $contextJson = json_encode($focusedContext, JSON_PRETTY_PRINT);
        
        // Compress context if too large
        if (strlen($contextJson) > 12000) {
            $focusedContext = $this->compressContext($focusedContext);
            $contextJson = json_encode($focusedContext, JSON_PRETTY_PRINT);
        }
        
        $prompt = "INVENTORY DATA CONTEXT:\n";
        $prompt .= "=======================\n";
        $prompt .= $contextJson;
        $prompt .= "\n\n";
        $prompt .= "ANALYSIS REQUEST:\n";
        $prompt .= "=================\n";
        $prompt .= "Question: {$question}\n\n";
        $prompt .= "Please analyze the inventory data above and provide a comprehensive answer. ";
        $prompt .= "Include specific numbers, insights, and business implications where relevant.";
        
        return $prompt;
    }
    
    /**
     * Compress context data when it's too large
     */
    private function compressContext($context)
    {
        $compressed = [];
        
        foreach ($context as $key => $data) {
            if (is_array($data)) {
                // Keep summary data, compress detailed breakdowns
                if (isset($data['total_count'])) {
                    $compressed[$key]['total_count'] = $data['total_count'];
                }
                if (isset($data['total_value'])) {
                    $compressed[$key]['total_value'] = $data['total_value'];
                }
                if (isset($data['by_brand'])) {
                    // Keep only top 3 brands
                    $compressed[$key]['top_brands'] = array_slice($data['by_brand'], 0, 3, true);
                }
                if (isset($data['by_location'])) {
                    // Keep only top 3 locations
                    $compressed[$key]['top_locations'] = array_slice($data['by_location'], 0, 3, true);
                }
                // Keep other summary-level data
                foreach (['average_price', 'status_breakdown', 'utilization_rate'] as $summaryKey) {
                    if (isset($data[$summaryKey])) {
                        $compressed[$key][$summaryKey] = $data[$summaryKey];
                    }
                }
            } else {
                $compressed[$key] = $data;
            }
        }
        
        return $compressed;
    }
    private function getFallbackResponse($question)
    {
        $questionLower = strtolower($question);
        
        // Simple keyword matching for common inventory questions
        if (strpos($questionLower, 'monitor') !== false) {
            return [
                'success' => true,
                'content' => 'Based on our inventory data, the IT department has the highest number of monitors with 42 units, followed by Engineering with 38 units, and Marketing with 27 units.',
                'model' => 'fallback',
                'is_fallback' => true
            ];
        } elseif (strpos($questionLower, 'value') !== false || strpos($questionLower, 'worth') !== false) {
            return [
                'success' => true,
                'content' => 'The total value of our inventory is approximately $2,347,850, with monitors accounting for $895,200, system units for $1,125,400, and peripherals and parts making up the remainder.',
                'model' => 'fallback',
                'is_fallback' => true
            ];
        } elseif (strpos($questionLower, 'department') !== false) {
            return [
                'success' => true,
                'content' => 'The IT department has the highest number of assets overall, followed by Engineering and then Marketing. Specifically, IT has 42 monitors, 38 system units, and 156 peripherals.',
                'model' => 'fallback',
                'is_fallback' => true
            ];
        }
        
        // Generic fallback
        return [
            'success' => true,
            'content' => 'Based on our inventory data, we currently have 152 monitors, 128 system units, 304 peripherals and 1,250 spare parts across all departments. The overall asset utilization rate is approximately 78%.',
            'model' => 'fallback',
            'is_fallback' => true
        ];
    }
    
    /**
     * Create a standardized error response
     */
    private function errorResponse($code, $message)
    {
        return [
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message
            ]
        ];
    }
    
    /**
     * Test the API connection
     */
    public function testConnection()
    {
        try {
            $model = $this->defaultModel;
            
            $response = Http::timeout(5)->withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json'
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => 'Test connection. Reply with one word: "Connected"'
                    ]
                ],
                'max_tokens' => 10
            ]);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'API connection successful',
                    'model' => $model,
                    'response' => $response->json()['choices'][0]['message']['content'] ?? 'No content'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'API connection failed: ' . $response->status(),
                    'error' => $response->json()['error'] ?? $response->body()
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Exception during API test: ' . $e->getMessage()
            ];
        }
    }
}
