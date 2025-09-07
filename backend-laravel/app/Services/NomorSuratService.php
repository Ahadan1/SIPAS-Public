<?php

namespace App\Services;

use App\Models\Document;
use App\Models\JenisNaskah;
use App\Models\Klasifikasi;
use Carbon\Carbon;

class NomorSuratService
{
    public function generate(
        int $jenisNaskahId,
        int $klasifikasiId
    ): array
    {
        $jenisNaskah = JenisNaskah::findOrFail($jenisNaskahId);
        $klasifikasi = Klasifikasi::findOrFail($klasifikasiId);
        $year = Carbon::now()->year;

        // 1. Get the next sequence number (no_urut)
        $lastDocument = Document::where('jenis_naskah_id', $jenisNaskahId)
            ->where('klasifikasi_id', $klasifikasiId)
            ->whereYear('tanggal_surat', $year)
            ->orderBy('nomor_urut', 'desc')
            ->first();

        $nomorUrut = $lastDocument ? $lastDocument->nomor_urut + 1 : 1;

        // 2. Format the full letter number (no_surat)
        // This format is based on the logic from the old CodeIgniter controller.
        // Example: SK-001/UN2.F13.DIR/EKN/2024
        $nomorSurat = sprintf('%s-%03d/UN2.F13.DIR/%s/%d',
            $jenisNaskah->kode,
            $nomorUrut,
            $klasifikasi->kode,
            $year
        );

        return [
            'nomor_urut' => $nomorUrut,
            'nomor_surat' => $nomorSurat,
        ];
    }
}
