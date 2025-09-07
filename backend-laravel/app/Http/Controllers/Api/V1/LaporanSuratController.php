<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Exports\SuratKeluarExport;
use App\Exports\SuratMasukExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class LaporanSuratController extends Controller
{
    public function exportSuratMasuk(Request $request)
    {
        $request->validate([
            'tgl_awal' => 'required|date',
            'tgl_akhir' => 'required|date|after_or_equal:tgl_awal',
        ]);

        $tglAwal = $request->input('tgl_awal');
        $tglAkhir = $request->input('tgl_akhir');

        return Excel::download(new SuratMasukExport($tglAwal, $tglAkhir), 'laporan-surat-masuk.xlsx');
    }

    public function exportSuratKeluar(Request $request)
    {
        $request->validate([
            'tgl_awal' => 'required|date',
            'tgl_akhir' => 'required|date|after_or_equal:tgl_awal',
        ]);

        $tglAwal = $request->input('tgl_awal');
        $tglAkhir = $request->input('tgl_akhir');

        return Excel::download(new SuratKeluarExport($tglAwal, $tglAkhir), 'laporan-surat-keluar.xlsx');
    }
}
