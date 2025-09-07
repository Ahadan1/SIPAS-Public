<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RefPenandatanganan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RefPenandatangananController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(RefPenandatanganan::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'required|string|max:255|unique:ref_penandatanganans,kode',
            'file_ttd' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('file_ttd')) {
            $validated['file_ttd'] = $request->file('file_ttd')->store('public/file_ttd');
        }

        $refPenandatanganan = RefPenandatanganan::create($validated);

        return response()->json($refPenandatanganan, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(RefPenandatanganan $refPenandatanganan)
    {
        return response()->json($refPenandatanganan);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RefPenandatanganan $refPenandatanganan)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'required|string|max:255|unique:ref_penandatanganans,kode,' . $refPenandatanganan->id,
            'file_ttd' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('file_ttd')) {
            // Delete old file if it exists
            if ($refPenandatanganan->file_ttd) {
                Storage::delete($refPenandatanganan->file_ttd);
            }
            $validated['file_ttd'] = $request->file('file_ttd')->store('public/file_ttd');
        }

        $refPenandatanganan->update($validated);

        return response()->json($refPenandatanganan);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RefPenandatanganan $refPenandatanganan)
    {
        // Delete the file if it exists
        if ($refPenandatanganan->file_ttd) {
            Storage::delete($refPenandatanganan->file_ttd);
        }

        $refPenandatanganan->delete();

        return response()->json(null, 204);
    }
}
