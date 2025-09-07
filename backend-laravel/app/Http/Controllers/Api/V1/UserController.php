<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Optional filter: only active/inactive users
        if ($request->filled('is_active')) {
            $query->where('is_active', (int) $request->input('is_active'));
        }

        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where('nama', 'like', "%{$searchTerm}%")
                  ->orWhere('username', 'like', "%{$searchTerm}%");
        }

        // Pagination control: per_page=all returns full list; otherwise paginate
        $perPageParam = $request->input('per_page');
        if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
            return UserResource::collection($query->get());
        }
        $perPage = is_numeric($perPageParam) ? max(1, (int) $perPageParam) : 15;
        return UserResource::collection($query->paginate($perPage));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nama' => 'required|string|max:255',
            'username' => 'required|string|unique:users|max:255',
            'email' => 'required|string|email|unique:users|max:255',
            'password' => 'required|string|min:8|confirmed',
            'jabatan_id' => 'required|integer|exists:jabatan,id',
            'kode_uk' => 'nullable|string|max:255',
            'level' => 'required|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $validatedData['password'] = Hash::make($validatedData['password']);

        $user = User::create($validatedData);

        return response()->json($user, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return $user;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validatedData = $request->validate([
            'nama' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'jabatan_id' => 'required|integer|exists:jabatan,id',
            'kode_uk' => 'nullable|string|max:255',
            'level' => 'required|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        if (!empty($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        } else {
            unset($validatedData['password']);
        }

        $user->update($validatedData);

        return response()->json($user);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->noContent();
    }

    /**
     * Update only the user's password.
     */
    public function changePassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->noContent();
    }

    /**
     * Quicklist of active users for selects.
     * Optionally scope by authenticated user's kode_uk when scope=unit.
     */
    public function activeQuicklist(Request $request)
    {
        $query = User::query()
            ->where('is_active', 1)
            ->select(['id', 'nama as name', 'kode_uk']);

        if ($request->boolean('scope_unit', false)) {
            $kodeUk = $request->user()?->kode_uk ?? $request->user()?->jabatan?->kode_uk;
            if ($kodeUk) {
                $query->where('kode_uk', $kodeUk);
            }
        }

        return response()->json($query->orderBy('name')->get());
    }
}
