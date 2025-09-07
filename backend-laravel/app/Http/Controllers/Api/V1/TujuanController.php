<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tujuan;
use Illuminate\Http\Request;

class TujuanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Tujuan::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:tujuans,nama',
        ]);

        $tujuan = Tujuan::create($validated);

        return response()->json($tujuan, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tujuan $tujuan)
    {
        return response()->json($tujuan);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tujuan $tujuan)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:tujuans,nama,' . $tujuan->id,
        ]);

        $tujuan->update($validated);

        return response()->json($tujuan);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tujuan $tujuan)
    {
        $tujuan->delete();

        return response()->json(null, 204);
    }
}
