<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Kegiatan;
use App\Models\Notulen;
use App\Models\SuratKeluar;
use App\Models\SuratMasuk;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get the user's kode_uk from their jabatan
        $kodeUk = $user->jabatan->kode_uk ?? null;

        if (!$kodeUk) {
            $activeUsers = 0;
            return response()->json([
                'surat_masuk' => 0,
                'surat_keluar' => 0,
                'laporan_kegiatan' => 0,
                'laporan_notulen' => 0,
                'active_users' => $activeUsers,
            ]);
        }

        // Count surat masuk for the user's work unit
        $suratMasukCount = SuratMasuk::whereHas('penerima.jabatan', function ($query) use ($kodeUk) {
            $query->where('kode_uk', $kodeUk);
        })->count();

        // Count surat keluar for the user's work unit
        $suratKeluarCount = SuratKeluar::where('kode_uk', $kodeUk)->count();

        // Count kegiatan for the user's work unit
        $laporanKegiatanCount = Kegiatan::where('kode_uk', $kodeUk)->count();

        // Count notulen for the user's work unit
        $laporanNotulenCount = Notulen::where('kode_uk', $kodeUk)->count();

        // Count active users scoped to the same Unit Kerja
        $activeUsers = User::where('is_active', 1)
            ->where('kode_uk', $kodeUk)
            ->count();

        return response()->json([
            'surat_masuk' => $suratMasukCount,
            'surat_keluar' => $suratKeluarCount,
            'laporan_kegiatan' => $laporanKegiatanCount,
            'laporan_notulen' => $laporanNotulenCount,
            'active_users' => $activeUsers,
        ]);
    }
}
