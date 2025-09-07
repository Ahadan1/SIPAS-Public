<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Jabatan;
use Illuminate\Http\Request;

class JabatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Jabatan::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nama_jabatan' => 'required|string|unique:jabatan|max:255',
            'level' => 'required|integer',
        ]);

        $jabatan = Jabatan::create($validatedData);

        return response()->json($jabatan, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Jabatan $jabatan)
    {
        return $jabatan;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Jabatan $jabatan)
    {
        $validatedData = $request->validate([
            'nama_jabatan' => 'required|string|unique:jabatan,nama_jabatan,' . $jabatan->id . '|max:255',
            'level' => 'required|integer',
        ]);

        $jabatan->update($validatedData);

        return response()->json($jabatan);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Jabatan $jabatan)
    {
        $jabatan->delete();

        return response()->noContent();
    }
}
