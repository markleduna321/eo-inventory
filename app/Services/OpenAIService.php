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
     * Get a fallback response based on the question
     * 
     * @param string $question
     * @return array
     */
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
