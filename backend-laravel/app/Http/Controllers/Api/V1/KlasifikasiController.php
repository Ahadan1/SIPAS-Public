<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Klasifikasi;
use Illuminate\Http\Request;

class KlasifikasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Klasifikasi::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'kode_klasifikasi' => 'required|string|unique:klasifikasi|max:255',
            'nama_klasifikasi' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ]);

        $klasifikasi = Klasifikasi::create($validatedData);

        return response()->json($klasifikasi, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Klasifikasi $klasifikasi)
    {
        return $klasifikasi;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Klasifikasi $klasifikasi)
    {
        $validatedData = $request->validate([
            'kode_klasifikasi' => 'required|string|unique:klasifikasi,kode_klasifikasi,' . $klasifikasi->id . '|max:255',
            'nama_klasifikasi' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ]);

        $klasifikasi->update($validatedData);

        return response()->json($klasifikasi);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Klasifikasi $klasifikasi)
    {
        $klasifikasi->delete();

        return response()->noContent();
    }
}
