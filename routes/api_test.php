<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

Route::get('/test-openai', function () {
    try {
        $apiKey = env('OPENAI_API_KEY');
        
        if (!$apiKey) {
            return response()->json([
                'status' => 'error',
                'message' => 'API key not found in environment variables'
            ], 500);
        }
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json'
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a helpful assistant.'
                ],
                [
                    'role' => 'user',
                    'content' => 'Test message - is this API key working?'
                ]
            ],
            'max_tokens' => 50
        ]);
        
        if ($response->successful()) {
            return response()->json([
                'status' => 'success',
                'message' => 'API key is valid',
                'response' => $response->json()
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'API request failed',
                'details' => $response->json()
            ], 500);
        }
    } catch (\Exception $e) {
        Log::error('OpenAI API Test Error: ' . $e->getMessage());
        return response()->json([
            'status' => 'error',
            'message' => 'Exception occurred: ' . $e->getMessage()
        ], 500);
    }
});
