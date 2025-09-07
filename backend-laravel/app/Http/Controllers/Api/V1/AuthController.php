<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // FIXED: import Auth facade
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Validate input
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Attempt login
        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Get authenticated user
        $user = User::with('jabatan')->find(Auth::id());

        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Return response
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'nama' => $user->nama,
                'jabatan' => $user->jabatan->nama_jabatan ?? null,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Revoke all personal access tokens for the authenticated user.
     */
    public function revokeAll(Request $request)
    {
        $user = $request->user();
        // Delete all tokens for this user (logout from all devices/clients)
        $user->tokens()->delete();

        return response()->json(['message' => 'All tokens revoked successfully']);
    }
}
