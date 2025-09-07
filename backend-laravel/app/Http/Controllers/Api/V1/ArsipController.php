<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SuratKeluar;
use App\Models\SuratMasuk;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class ArsipController extends Controller
{
    /**
     * Display a listing of the resource.
     */
        public function index(Request $request)
    {
        $request->validate([
            'type' => 'required|in:masuk,keluar',
        ]);

        $type = $request->input('type');
        $query = $type === 'masuk' ? SuratMasuk::query() : SuratKeluar::query();

        // Only archived items (exists in arsips with correct morph type)
        if ($type === 'masuk') {
            $query->whereExists(function($q) {
                $q->select(DB::raw(1))
                  ->from('arsips')
                  ->whereColumn('arsips.surat_id', 'surat_masuk.id')
                  ->where('arsips.surat_type', SuratMasuk::class);
            });
        } else {
            $query->whereExists(function($q) {
                $q->select(DB::raw(1))
                  ->from('arsips')
                  ->whereColumn('arsips.surat_id', 'surat_keluars.id_surat')
                  ->where('arsips.surat_type', SuratKeluar::class);
            });
        }

        // Filters
        if ($type === 'masuk') {
            // Join documents for filters on document fields
            $query->select('surat_masuk.*')
                  ->join('documents', 'documents.id', '=', 'surat_masuk.document_id');

            $query->when($request->input('no_surat'), function ($q, $no_surat) {
                return $q->where('documents.nomor_surat', 'like', "%{$no_surat}%");
            });

            $query->when($request->input('perihal'), function ($q, $perihal) {
                return $q->where('documents.perihal', 'like', "%{$perihal}%");
            });

            $query->when($request->input('tgl_surat'), function ($q, $tgl_surat) {
                return $q->whereDate('documents.tanggal_surat', $tgl_surat);
            });

            // Map pengirim -> asal_surat in surat_masuk
            $query->when($request->input('pengirim'), function ($q, $pengirim) {
                return $q->where('surat_masuk.asal_surat', 'like', "%{$pengirim}%");
            });
        } else {
            // Surat Keluar filters remain on surat_keluars
            $query->when($request->input('no_surat'), function ($q, $no_surat) {
                return $q->where('no_surat', 'like', "%{$no_surat}%");
            });

            $query->when($request->input('perihal'), function ($q, $perihal) {
                return $q->where('perihal', 'like', "%{$perihal}%");
            });

            $query->when($request->input('tgl_surat'), function ($q, $tgl_surat) {
                return $q->whereDate('tgl_surat', $tgl_surat);
            });

            $query->when($request->input('tujuan'), function ($q, $tujuan) {
                return $q->where('tujuan', 'like', "%{$tujuan}%");
            });

            $query->when($request->input('kode_jenis'), function ($q, $kode_jenis) {
                return $q->where('kode_jenis', $kode_jenis);
            });

            // Map unit_kerja -> kode_uk
            $query->when($request->input('unit_kerja'), function ($q, $unit_kerja) {
                return $q->where('kode_uk', 'like', "%{$unit_kerja}%");
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        $arsip = $query->latest()->paginate($perPage);

        return response()->json($arsip);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $surat = SuratMasuk::find($id);

        if (!$surat) {
            $surat = SuratKeluar::find($id);
        }

        if (!$surat) {
            return response()->json(['message' => 'Arsip tidak ditemukan'], 404);
        }

        return response()->json($surat);
    }
}
