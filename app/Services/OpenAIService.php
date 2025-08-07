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
            'gpt-3.5-turbo', 
            'gpt-3.5-turbo-1106', 
            'gpt-4-0613'
        ];
        $this->temperature = (float)env('OPENAI_TEMPERATURE', 0.3);
        $this->maxTokens = (int)env('OPENAI_MAX_TOKENS', 500);
        $this->maxRetries = (int)env('OPENAI_MAX_RETRIES', 3);
        $this->cacheTime = (int)env('OPENAI_CACHE_TIME', 60); // Cache responses for 1 hour by default
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
        $retryCount = 0;
        $modelIndex = -1; // Start with default model
        
        // Keep track of tried models to avoid duplicates
        $triedModels = [];
        
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
                Log::info('Attempting OpenAI request', ['model' => $model, 'retry' => $retryCount]);
                
                // Calculate dynamic timeout based on token length
                $baseTimeout = 10; // Base 10 seconds
                $promptLength = mb_strlen($systemPrompt) + mb_strlen($userPrompt);
                $timeout = $baseTimeout + ceil($promptLength / 500); // Add 1 second per 500 chars
                
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
                        ];
                        
                        // Cache successful responses
                        Cache::put($cacheKey, $result, $this->cacheTime);
                        
                        return $result;
                    } else {
                        Log::error('Unexpected OpenAI response structure', ['response' => $responseData]);
                    }
                } else {
                    $statusCode = $response->status();
                    $errorBody = $response->body();
                    $errorData = $response->json();
                    
                    Log::error("Error calling OpenAI API: HTTP $statusCode", [
                        'error_body' => $errorBody,
                        'model' => $model
                    ]);
                    
                    // Check for specific error types to determine if we should retry
                    $errorType = $errorData['error']['type'] ?? '';
                    $errorMessage = $errorData['error']['message'] ?? '';
                    
                    // For rate limit issues, wait longer before retry
                    if ($statusCode === 429) {
                        Log::warning('OpenAI rate limit reached, waiting before retry', ['model' => $model]);
                        sleep(2 * ($retryCount + 1)); // Progressive backoff
                    }
                    
                    // For server errors, move to next model more quickly
                    if ($statusCode >= 500) {
                        $modelIndex++;
                    }
                }
                
            } catch (\Exception $e) {
                Log::error('Exception calling OpenAI API', [
                    'error' => $e->getMessage(),
                    'model' => $model
                ]);
            }
            
            // Increment retry counter
            $retryCount++;
        }
        
        // If we've exhausted all retries, return appropriate error
        if (in_array(429, array_map(function($m) { 
            return Http::withHeaders(['Authorization' => 'Bearer ' . $this->apiKey])
                ->get('https://api.openai.com/v1/models')->status(); 
        }, [1]))) {
            return $this->errorResponse('rate_limit_exceeded', 'The AI service is currently experiencing high demand. Please try again in a few moments.');
        }
        
        return $this->errorResponse('api_error', 'Unable to generate a response at this time.');
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
