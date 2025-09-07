<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SuratRekap;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

class SuratRekapController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rekaps = SuratRekap::all();
        return response()->json($rekaps);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tahun' => 'required|string',
            'kode_uk' => 'required|string',
            'file_upload' => 'nullable|file',
        ]);
        $fileName = null;
        if ($request->hasFile('file_upload')) {
            $ext = $request->file('file_upload')->getClientOriginalExtension();
            $fileName = 'surat_rekap-' . Carbon::now()->format('ymdhis') . '.' . $ext;
            $request->file('file_upload')->storeAs('public/surat_rekap', $fileName);
        }
        $rekap = SuratRekap::create([
            'tanggal' => Carbon::now()->toDateString(),
            'tahun' => $validated['tahun'],
            'file_upload' => $fileName,
            'id_user' => 1, // replace with auth()->id() if using auth
            'kode_uk' => $validated['kode_uk'],
        ]);
        return response()->json($rekap, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $rekap = SuratRekap::findOrFail($id);
        return response()->json($rekap);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $rekap = SuratRekap::findOrFail($id);
        $validated = $request->validate([
            'tahun' => 'sometimes|required|string',
            'kode_uk' => 'sometimes|required|string',
            'file_upload' => 'nullable|file',
        ]);
        $data = $validated;
        if ($request->hasFile('file_upload')) {
            $ext = $request->file('file_upload')->getClientOriginalExtension();
            $fileName = 'surat_rekap-' . Carbon::now()->format('ymdhis') . '.' . $ext;
            $request->file('file_upload')->storeAs('public/surat_rekap', $fileName);
            $data['file_upload'] = $fileName;
        } else {
            $data['file_upload'] = $rekap->file_upload;
        }
        $data['id_user'] = 1; // replace with auth()->id() if using auth
        $rekap->update($data);
        return response()->json($rekap);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $rekap = SuratRekap::findOrFail($id);
        if ($rekap->file_upload) {
            Storage::delete('public/surat_rekap/' . $rekap->file_upload);
        }
        $rekap->delete();
        return response()->json(null, 204);
    }
}
