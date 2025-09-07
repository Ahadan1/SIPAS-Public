<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RefTujuan;
use Illuminate\Http\Request;

class RefTujuanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = RefTujuan::all();
        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'required|string|max:50|unique:ref_tujuans',
            'uraian' => 'nullable|string',
        ]);
        
        $refTujuan = RefTujuan::create($validated);
        return response()->json($refTujuan, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(RefTujuan $refTujuan)
    {
        return response()->json($refTujuan);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RefTujuan $refTujuan)
    {
        $validated = $request->validate([
            'nama' => 'sometimes|required|string|max:255',
            'kode' => 'sometimes|required|string|max:50|unique:ref_tujuans,kode,' . $refTujuan->id,
            'uraian' => 'nullable|string',
        ]);
        
        $refTujuan->update($validated);
        return response()->json($refTujuan);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RefTujuan $refTujuan)
    {
        $refTujuan->delete();
        return response()->json(null, 204);
    }
}
