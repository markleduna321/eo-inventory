<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = auth()->user();
        if ($user) {
            $user->update(['is_online' => true, 'updated_at' => now()]);
        }

        // Role-based redirection
        if (Auth::user()->role_id == 1) {
            return redirect()->intended(RouteServiceProvider::ADMIN);
        } else if (Auth::user()->role_id == 2) {
            return redirect()->intended(RouteServiceProvider::ADMIN); // Asset Manager goes to admin
        } else {
            // For all other roles, redirect to admin dashboard as fallback
            return redirect()->intended(RouteServiceProvider::ADMIN);
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = auth()->user(); // Get the authenticated user first
        if ($user) {
            $user->update(['is_online' => false, 'updated_at' => now()]); // Update is_online status
        }

        Auth::guard('web')->logout(); // Log out the user

        $request->session()->invalidate(); // Invalidate the session
        $request->session()->regenerateToken(); // Regenerate CSRF token

        return redirect('/'); // Redirect to the login or home page
    }
}
