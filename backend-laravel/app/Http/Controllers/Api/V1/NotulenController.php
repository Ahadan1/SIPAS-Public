<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Notulen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class NotulenController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $perPage = (int) $request->input('per_page', 15);
        $notulens = Notulen::where('kode_uk', $user->jabatan->kode_uk)
            ->orderBy('created_at', 'asc') // earliest input first
            ->paginate($perPage);
        return response()->json($notulens);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_kegiatan' => 'required|string|max:255',
            'tanggal_kegiatan' => 'required|date',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
            'audio' => 'nullable|file|mimes:mp3,wav,m4a|max:10240',
            'keterangan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $validator->validated();
        $user = Auth::user()->load('jabatan');

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('notulen_files', 'public');
        }

        if ($request->hasFile('audio')) {
            $data['audio_path'] = $request->file('audio')->store('notulen_audio', 'public');
        }

        $data['user_id'] = $user->id;
        $data['kode_uk'] = $user->jabatan->kode_uk;

        $notulen = Notulen::create($data);

        return response()->json($notulen, 201);
    }

    public function show(Notulen $notulen)
    {
        $this->authorize('view', $notulen);
        return response()->json($notulen);
    }

    public function update(Request $request, Notulen $notulen)
    {
        $this->authorize('update', $notulen);

        $validator = Validator::make($request->all(), [
            'nama_kegiatan' => 'sometimes|required|string|max:255',
            'tanggal_kegiatan' => 'sometimes|required|date',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
            'audio' => 'nullable|file|mimes:mp3,wav,m4a|max:10240',
            'keterangan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $validator->validated();

        if ($request->hasFile('file')) {
            if ($notulen->file_path) {
                Storage::disk('public')->delete($notulen->file_path);
            }
            $data['file_path'] = $request->file('file')->store('notulen_files', 'public');
        }

        if ($request->hasFile('audio')) {
            if ($notulen->audio_path) {
                Storage::disk('public')->delete($notulen->audio_path);
            }
            $data['audio_path'] = $request->file('audio')->store('notulen_audio', 'public');
        }

        $notulen->update($data);

        return response()->json($notulen);
    }

    public function destroy(Notulen $notulen)
    {
        $this->authorize('delete', $notulen);

        if ($notulen->file_path) {
            Storage::disk('public')->delete($notulen->file_path);
        }
        if ($notulen->audio_path) {
            Storage::disk('public')->delete($notulen->audio_path);
        }

        $notulen->delete();

        return response()->json(null, 204);
    }
}
