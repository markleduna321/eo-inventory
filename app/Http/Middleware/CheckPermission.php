<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = Auth::user();

        // If no user is authenticated, redirect to login
        if (!$user) {
            return redirect('/login');
        }

        // If user has no role, deny access
        if (!$user->role) {
            abort(403, 'Access denied: No role assigned');
        }

        // Super Administrator should have access to everything
        if ($user->role->name === 'Super Administrator' || $user->role->level === 5) {
            return $next($request);
        }

        // Check if user's role has the required permission
        $userPermissions = $user->role->permissions ?? [];
        
        if (!in_array($permission, $userPermissions)) {
            abort(403, 'Access denied: Insufficient permissions');
        }

        return $next($request);
    }
}
