<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RefJenisNaskah;
use Illuminate\Http\Request;

class RefJenisNaskahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = RefJenisNaskah::all();
        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'required|string|max:50|unique:ref_jenis_naskahs',
            'uraian' => 'nullable|string',
        ]);
        
        $refJenisNaskah = RefJenisNaskah::create($validated);
        return response()->json($refJenisNaskah, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(RefJenisNaskah $refJenisNaskah)
    {
        return response()->json($refJenisNaskah);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RefJenisNaskah $refJenisNaskah)
    {
        $validated = $request->validate([
            'nama' => 'sometimes|required|string|max:255',
            'kode' => 'sometimes|required|string|max:50|unique:ref_jenis_naskahs,kode,' . $refJenisNaskah->id,
            'uraian' => 'nullable|string',
        ]);
        
        $refJenisNaskah->update($validated);
        return response()->json($refJenisNaskah);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RefJenisNaskah $refJenisNaskah)
    {
        $refJenisNaskah->delete();
        return response()->json(null, 204);
    }
}
