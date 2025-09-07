<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LembarPantau;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class LembarPantauController extends Controller
{
    /**
     * Display a listing of the resource.
     * This will be filtered by id_surat passed in the query string.
     */
    public function index(Request $request)
    {
        $query = LembarPantau::query();
        if ($request->has('id_surat')) {
            $query->where('id_surat', $request->id_surat);
        }
        $data = $query->get();
        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_surat' => 'required|integer',
            'id_jabatan' => 'required|integer',
            'catatan' => 'nullable|string',
            'tgl_paraf' => 'required|date',
        ]);
        $lembarPantau = LembarPantau::create([
            'id_surat' => $validated['id_surat'],
            'id_jabatan' => $validated['id_jabatan'],
            'catatan' => $validated['catatan'] ?? null,
            'tgl_paraf' => $validated['tgl_paraf'],
            'tgl_input' => Carbon::now()->toDateString(),
        ]);
        return response()->json($lembarPantau, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $lembarPantau = LembarPantau::findOrFail($id);
        return response()->json($lembarPantau);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $lembarPantau = LembarPantau::findOrFail($id);
        $validated = $request->validate([
            'id_surat' => 'sometimes|required|integer',
            'id_jabatan' => 'sometimes|required|integer',
            'catatan' => 'nullable|string',
            'tgl_paraf' => 'sometimes|required|date',
        ]);
        $data = $validated;
        $lembarPantau->update($data);
        return response()->json($lembarPantau);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $lembarPantau = LembarPantau::findOrFail($id);
        $lembarPantau->delete();
        return response()->json(null, 204);
    }
}