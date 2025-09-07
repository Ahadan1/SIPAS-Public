<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RefKlasifikasi;
use Illuminate\Http\Request;

class RefKlasifikasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = RefKlasifikasi::all();
        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'required|string|max:50|unique:ref_klasifikasis',
            'uraian' => 'nullable|string',
        ]);
        
        $refKlasifikasi = RefKlasifikasi::create($validated);
        return response()->json($refKlasifikasi, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(RefKlasifikasi $refKlasifikasi)
    {
        return response()->json($refKlasifikasi);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RefKlasifikasi $refKlasifikasi)
    {
        $validated = $request->validate([
            'nama' => 'sometimes|required|string|max:255',
            'kode' => 'sometimes|required|string|max:50|unique:ref_klasifikasis,kode,' . $refKlasifikasi->id,
            'uraian' => 'nullable|string',
        ]);
        
        $refKlasifikasi->update($validated);
        return response()->json($refKlasifikasi);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RefKlasifikasi $refKlasifikasi)
    {
        $refKlasifikasi->delete();
        return response()->json(null, 204);
    }
}
