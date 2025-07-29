<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiLogMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Log the request details
        Log::channel('daily')->info('API Request', [
            'uri' => $request->getPathInfo(),
            'method' => $request->getMethod(),
            'data' => $request->all(),
        ]);
        
        // Process the request
        $response = $next($request);
        
        // Get the response content
        $content = $response->getContent();
        
        try {
            // Try to decode JSON response
            $data = json_decode($content, true);
            // Log the response
            Log::channel('daily')->info('API Response', [
                'uri' => $request->getPathInfo(),
                'status' => $response->getStatusCode(),
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            // Log error if response is not valid JSON
            Log::channel('daily')->error('API Response Error', [
                'uri' => $request->getPathInfo(),
                'status' => $response->getStatusCode(),
                'error' => $e->getMessage(),
            ]);
        }
        
        return $response;
    }
}
