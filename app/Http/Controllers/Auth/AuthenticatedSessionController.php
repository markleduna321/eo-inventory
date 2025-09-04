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
        return Inertia::render('login/page', [
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
            // Check if user is already logged in from another device
            if ($user->current_session_id && $user->current_session_id !== session()->getId()) {
                // Logout from previous session
                \Illuminate\Support\Facades\DB::table('sessions')
                    ->where('id', $user->current_session_id)
                    ->delete();
            }
            
            // Update user session info
            $user->update([
                'is_online' => true, 
                'current_session_id' => session()->getId(),
                'last_activity' => now(),
                'updated_at' => now()
            ]);
        }

        // All users redirect to admin dashboard
        // Access control is handled by permissions on individual pages
        return redirect()->intended(RouteServiceProvider::ADMIN);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Update user's online status and clear session before logout
        $user = auth()->user();
        if ($user) {
            $user->update([
                'is_online' => false,
                'current_session_id' => null,
                'last_activity' => now()
            ]);
        }

        // Log out the user
        Auth::guard('web')->logout();

        // Invalidate the session 
        $request->session()->invalidate();
        
        // Regenerate the session token
        $request->session()->regenerateToken();

        return redirect('/')->with('message', 'You have been logged out successfully.');
    }
}
