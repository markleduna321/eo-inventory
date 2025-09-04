<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class SessionController extends Controller
{
    /**
     * Check if the current session is still valid
     */
    public function status(): JsonResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            // Update last activity
            $user->update(['last_activity' => now()]);
            
            return response()->json([
                'authenticated' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'last_activity' => $user->last_activity
                ]
            ]);
        }
        
        return response()->json([
            'authenticated' => false,
            'message' => 'Not authenticated'
        ], 401);
    }
    
    /**
     * Extend the current session
     */
    public function extend(Request $request): JsonResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            // Update last activity and session
            $user->update([
                'last_activity' => now(),
                'current_session_id' => session()->getId()
            ]);
            
            // Regenerate session to extend it
            $request->session()->regenerate();
            
            return response()->json([
                'success' => true,
                'message' => 'Session extended successfully',
                'expires_at' => now()->addMinutes(config('session.lifetime', 480))
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Not authenticated'
        ], 401);
    }
    
    /**
     * Force logout from all other sessions
     */
    public function logoutOtherSessions(Request $request): JsonResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            $currentSessionId = session()->getId();
            
            // Clear other sessions from database
            \Illuminate\Support\Facades\DB::table('sessions')
                ->where('user_id', $user->id)
                ->where('id', '!=', $currentSessionId)
                ->delete();
            
            // Update user's current session
            $user->update([
                'current_session_id' => $currentSessionId,
                'last_activity' => now()
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Logged out from all other sessions'
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Not authenticated'
        ], 401);
    }
    
    /**
     * Get session information
     */
    public function info(): JsonResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            return response()->json([
                'session_id' => session()->getId(),
                'user_id' => $user->id,
                'last_activity' => $user->last_activity,
                'session_lifetime' => config('session.lifetime', 480),
                'expires_at' => now()->addMinutes(config('session.lifetime', 480))
            ]);
        }
        
        return response()->json([
            'message' => 'Not authenticated'
        ], 401);
    }
}
