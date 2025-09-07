<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RefDisposisi;
use Illuminate\Http\Request;

class RefDisposisiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(RefDisposisi::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:ref_disposisis,nama',
        ]);

        $refDisposisi = RefDisposisi::create($validated);

        return response()->json($refDisposisi, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(RefDisposisi $refDisposisi)
    {
        return response()->json($refDisposisi);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RefDisposisi $refDisposisi)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:ref_disposisis,nama,' . $refDisposisi->id,
        ]);

        $refDisposisi->update($validated);

        return response()->json($refDisposisi);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RefDisposisi $refDisposisi)
    {
        $refDisposisi->delete();

        return response()->json(null, 204);
    }
}
