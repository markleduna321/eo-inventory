<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CsrfController extends Controller
{
    public function refresh(Request $request)
    {
        return response()->json([
            'csrf_token' => csrf_token()
        ]);
    }
}
