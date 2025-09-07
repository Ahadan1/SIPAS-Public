<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Arsip;
use App\Models\SuratMasuk;
use App\Models\SuratKeluar;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ArsipActionController extends Controller
{
    public function archiveSuratMasuk(Request $request, $id)
    {
        $surat = SuratMasuk::findOrFail($id);
        // TODO: $this->authorize('archive', $surat);
        $user = $request->user();
        $arsip = Arsip::firstOrCreate(
            [
                'surat_type' => SuratMasuk::class,
                'surat_id' => $surat->getKey(),
            ],
            [
                'unit_kerja' => $surat->unit_kerja ?? null,
                'archived_by' => $user?->id,
                'archived_at' => Carbon::now(),
            ]
        );
        return response()->json(['message' => 'Surat Masuk diarsipkan', 'arsip' => $arsip], 201);
    }

    public function unarchiveSuratMasuk(Request $request, $id)
    {
        $surat = SuratMasuk::findOrFail($id);
        // TODO: $this->authorize('unarchive', $surat);
        $deleted = Arsip::where('surat_type', SuratMasuk::class)
            ->where('surat_id', $surat->getKey())
            ->delete();
        return response()->json(['message' => $deleted ? 'Surat Masuk batal diarsipkan' : 'Tidak ditemukan arsip', 'deleted' => (bool)$deleted]);
    }

    public function archiveSuratKeluar(Request $request, $id)
    {
        $surat = SuratKeluar::findOrFail($id);
        // TODO: $this->authorize('archive', $surat);
        $user = $request->user();
        $arsip = Arsip::firstOrCreate(
            [
                'surat_type' => SuratKeluar::class,
                'surat_id' => $surat->getKey(),
            ],
            [
                'unit_kerja' => $surat->kode_uk ?? null,
                'archived_by' => $user?->id,
                'archived_at' => Carbon::now(),
            ]
        );
        return response()->json(['message' => 'Surat Keluar diarsipkan', 'arsip' => $arsip], 201);
    }

    public function unarchiveSuratKeluar(Request $request, $id)
    {
        $surat = SuratKeluar::findOrFail($id);
        // TODO: $this->authorize('unarchive', $surat);
        $deleted = Arsip::where('surat_type', SuratKeluar::class)
            ->where('surat_id', $surat->getKey())
            ->delete();
        return response()->json(['message' => $deleted ? 'Surat Keluar batal diarsipkan' : 'Tidak ditemukan arsip', 'deleted' => (bool)$deleted]);
    }
}
