<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class KegiatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Respect client-specified page size, defaulting to 10
        $perPage = (int) $request->input('per_page', 10);
        $kegiatan = Kegiatan::with('fotos')->latest()->paginate($perPage);
        return response()->json($kegiatan);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kegiatan' => 'required|string|max:255',
            'tanggal_kegiatan' => 'required|date',
            'keterangan' => 'nullable|string',
            'youtube_link' => 'nullable|url',
            'kode_uk' => 'required|string',
            'main_file' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $kegiatan = new Kegiatan($validated);
        $kegiatan->user_id = Auth::id();

        if ($request->hasFile('main_file')) {
            $kegiatan->file_path = $request->file('main_file')->store('kegiatan_files', 'public');
        }

        $kegiatan->save();

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('kegiatan_photos', 'public');
                $kegiatan->fotos()->create(['file_path' => $path]);
            }
        }

        return response()->json($kegiatan->load('fotos'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Kegiatan $kegiatan)
    {
        return response()->json($kegiatan->load('fotos'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Kegiatan $kegiatan)
    {
        $validated = $request->validate([
            'nama_kegiatan' => 'sometimes|required|string|max:255',
            'tanggal_kegiatan' => 'sometimes|required|date',
            'keterangan' => 'nullable|string',
            'youtube_link' => 'nullable|url',
            'kode_uk' => 'sometimes|required|string',
            'main_file' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
        ]);

        if ($request->hasFile('main_file')) {
            // Delete old file if it exists
            if ($kegiatan->file_path) {
                Storage::disk('public')->delete($kegiatan->file_path);
            }
            $validated['file_path'] = $request->file('main_file')->store('kegiatan_files', 'public');
        }

        $kegiatan->update($validated);

        return response()->json($kegiatan->load('fotos'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Kegiatan $kegiatan)
    {
        // Delete main file
        if ($kegiatan->file_path) {
            Storage::disk('public')->delete($kegiatan->file_path);
        }

        // Delete associated photos
        foreach ($kegiatan->fotos as $foto) {
            Storage::disk('public')->delete($foto->file_path);
            $foto->delete();
        }

        $kegiatan->delete();

        return response()->json(null, 204);
    }
}
