<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RefJabatan;
use Illuminate\Http\Request;

class RefJabatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = RefJabatan::all();
        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'required|string|max:50|unique:ref_jabatans',
            'uraian' => 'nullable|string',
        ]);
        
        $refJabatan = RefJabatan::create($validated);
        return response()->json($refJabatan, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(RefJabatan $refJabatan)
    {
        return response()->json($refJabatan);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RefJabatan $refJabatan)
    {
        $validated = $request->validate([
            'nama' => 'sometimes|required|string|max:255',
            'kode' => 'sometimes|required|string|max:50|unique:ref_jabatans,kode,' . $refJabatan->id,
            'uraian' => 'nullable|string',
        ]);
        
        $refJabatan->update($validated);
        return response()->json($refJabatan);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RefJabatan $refJabatan)
    {
        $refJabatan->delete();
        return response()->json(null, 204);
    }
}
