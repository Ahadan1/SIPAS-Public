<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\JenisNaskah;
use Illuminate\Http\Request;

class JenisNaskahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Models\JenisNaskah::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nama_jenis' => 'required|string|unique:jenis_naskah|max:255',
            'deskripsi' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $jenisNaskah = \App\Models\JenisNaskah::create($validatedData);

        return response()->json($jenisNaskah, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(JenisNaskah $jenisNaskah)
    {
        return $jenisNaskah;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JenisNaskah $jenisNaskah)
    {
        $validatedData = $request->validate([
            'nama_jenis' => 'required|string|unique:jenis_naskah,nama_jenis,' . $jenisNaskah->id . '|max:255',
            'deskripsi' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $jenisNaskah->update($validatedData);

        return response()->json($jenisNaskah);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JenisNaskah $jenisNaskah)
    {
        $jenisNaskah->delete();

        return response()->noContent();
    }
}
