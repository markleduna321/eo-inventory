<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class HandleLogout
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If this is a logout request, handle it specially
        if ($request->is('logout') && $request->isMethod('POST')) {
            // Get the authenticated user before logout
            $user = Auth::user();
            
            // Update user's online status
            if ($user) {
                $user->is_online = false;
                $user->save();
            }
            
            // Clear authentication
            Auth::logout();
            
            // Invalidate the session
            $request->session()->invalidate();
            
            // Regenerate the session token
            $request->session()->regenerateToken();
            
            // Return a JSON response for Inertia requests
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Logged out successfully',
                    'redirect' => '/'
                ]);
            }
            
            // Regular redirect for non-Inertia requests
            return redirect('/')->with('message', 'You have been logged out successfully.');
        }
        
        return $next($request);
    }
}
