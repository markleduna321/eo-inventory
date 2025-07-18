<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$role_ids)
    {
        if (!$request->user() || !$this->checkRole($request->user()->role_id, $role_ids)) {
            return Inertia::location(route('login')); 
        }

        return $next($request);
    }

    private function checkRole($userRoleId, $requiredRoleIds)
    {
        // Check if user's role is in the array of allowed roles
        return in_array($userRoleId, $requiredRoleIds);
    }
}
