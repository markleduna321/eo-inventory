<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class SessionManagement
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only check for authenticated users
        if (Auth::check()) {
            $user = Auth::user();
            $currentSessionId = Session::getId();
            
            // Check if session has expired based on last activity
            $sessionLifetime = config('session.lifetime', 480) * 60; // Convert minutes to seconds
            $lastActivity = $user->last_activity;
            
            if ($lastActivity && now()->diffInSeconds($lastActivity) > $sessionLifetime) {
                // Session has expired, log out the user
                $this->logoutUser($user);
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Session expired. Please log in again.',
                        'redirect' => '/login'
                    ], 401);
                }
                
                return redirect()->route('login')->with('error', 'Your session has expired. Please log in again.');
            }
            
            // Check for single session per user
            if ($user->current_session_id && $user->current_session_id !== $currentSessionId) {
                // User has logged in from another device/browser
                $this->logoutUser($user);
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'You have been logged out because you logged in from another device.',
                        'redirect' => '/login'
                    ], 401);
                }
                
                return redirect()->route('login')->with('error', 'You have been logged out because you logged in from another device.');
            }
            
            // Update user's session info and last activity
            $user->update([
                'current_session_id' => $currentSessionId,
                'last_activity' => now(),
                'is_online' => true
            ]);
        }
        
        return $next($request);
    }
    
    /**
     * Log out the user and clean up session data
     */
    private function logoutUser($user)
    {
        // Clear user's session data
        $user->update([
            'current_session_id' => null,
            'is_online' => false
        ]);
        
        // Delete the session from database if using database sessions
        if (config('session.driver') === 'database' && $user->current_session_id) {
            DB::table('sessions')->where('id', $user->current_session_id)->delete();
        }
        
        // Log out the user
        Auth::logout();
        Session::flush();
        Session::regenerate();
    }
}
