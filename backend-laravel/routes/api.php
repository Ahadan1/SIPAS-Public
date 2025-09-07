<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DisposisiController;
use App\Http\Controllers\Api\V1\JabatanController;
use App\Http\Controllers\Api\V1\JenisNaskahController;
use App\Http\Controllers\Api\V1\KlasifikasiController;
use App\Http\Controllers\Api\V1\KegiatanController;
use App\Http\Controllers\Api\V1\LaporanSuratController;
use App\Http\Controllers\Api\V1\LaporanKegiatanController;
use App\Http\Controllers\Api\V1\LaporanNotulenController;
use App\Http\Controllers\Api\V1\NomorSuratController;
use App\Http\Controllers\Api\V1\SuratKeluarController;
use App\Http\Controllers\Api\V1\SuratRekapController;
use App\Http\Controllers\Api\V1\LembarPantauController;
use App\Http\Controllers\Api\V1\SuratMasukController;
use App\Http\Controllers\Api\V1\TujuanController;
use App\Http\Controllers\Api\V1\RefDisposisiController;
use App\Http\Controllers\Api\V1\RefPenandatangananController;
use App\Http\Controllers\Api\V1\RefJenisNaskahController;
use App\Http\Controllers\Api\V1\RefJabatanController;
use App\Http\Controllers\Api\V1\RefKlasifikasiController;
use App\Http\Controllers\Api\V1\RefTujuanController;
use App\Http\Controllers\Api\V1\UploadController;
use App\Http\Controllers\Api\V1\TembusanController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\ArsipController;
use App\Http\Controllers\Api\V1\ArsipActionController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\NotulenController;
use App\Http\Controllers\Api\V1\RefUnitKerjaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public route for login
Route::post('/login', [AuthController::class, 'login']);

// Protected API routes
Route::middleware(['auth:sanctum', 'bindings'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/tokens/revoke-all', [AuthController::class, 'revokeAll']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::prefix('v1')->group(function () {
        // Route disabled pending cleanup: no frontend usage found
        // Route::apiResource('disposisi', DisposisiController::class);
        Route::apiResource('surat-masuk', SuratMasukController::class);
        // Read/unread actions for surat-masuk
        Route::post('surat-masuk/{suratMasuk}/dibaca', [SuratMasukController::class, 'dibaca']);
        Route::post('surat-masuk/{suratMasuk}/belum', [SuratMasukController::class, 'belum']);
        Route::apiResource('jabatan', JabatanController::class);
        Route::apiResource('jenis-naskah', JenisNaskahController::class);
        Route::apiResource('klasifikasi', KlasifikasiController::class);
        Route::apiResource('surat-keluar', SuratKeluarController::class);
        Route::patch('surat-keluar/{id}/diarsipkan', [SuratKeluarController::class, 'diarsipkan']);
        Route::apiResource('surat-rekap', SuratRekapController::class);
        // Lembar Pantau routes (required by Surat Keluar: Buat Lembar Pantau)
        Route::apiResource('lembar-pantau', LembarPantauController::class);
        Route::apiResource('users', UserController::class);
        Route::patch('users/{user}/password', [UserController::class, 'changePassword']);
        // Quicklist: minimal active users for selects
        Route::get('users/active', [UserController::class, 'activeQuicklist']);
        // Kegiatan routes (required by Laporan Kegiatan page and others)
        Route::apiResource('kegiatan', KegiatanController::class);
        Route::apiResource('notulen', NotulenController::class);
        // Route disabled pending cleanup: no frontend usage found
        // Route::apiResource('tujuan', TujuanController::class);
        Route::apiResource('ref-disposisi', RefDisposisiController::class);
        Route::apiResource('ref-penandatanganan', RefPenandatangananController::class);
        Route::apiResource('ref-jenis-naskah', RefJenisNaskahController::class);
        Route::apiResource('ref-jabatan', RefJabatanController::class);
        Route::apiResource('ref-klasifikasi', RefKlasifikasiController::class);
        // Reference: Unit Kerja quicklist
        Route::get('ref-unit-kerja', [RefUnitKerjaController::class, 'index']);
        // Route disabled pending cleanup: no frontend usage found
        // Route::apiResource('ref-tujuan', RefTujuanController::class);
        Route::apiResource('upload', UploadController::class);

        // Laporan Routes
        Route::get('laporan/surat-masuk', [LaporanSuratController::class, 'exportSuratMasuk']);
        Route::get('laporan/surat-keluar', [LaporanSuratController::class, 'exportSuratKeluar']);

        // Laporan Kegiatan
        Route::get('laporan/kegiatan', [LaporanKegiatanController::class, 'index']);

        // Laporan Notulen
        Route::get('laporan/notulen', [LaporanNotulenController::class, 'index']);

        // Tembusan routes (required by frontend Surat Masuk page)
        Route::apiResource('tembusan', TembusanController::class);
        Route::apiResource('arsip', ArsipController::class)->only(['index', 'show']);

        // Archive/Unarchive actions
        Route::post('surat-masuk/{id}/arsip', [ArsipActionController::class, 'archiveSuratMasuk']);
        Route::delete('surat-masuk/{id}/arsip', [ArsipActionController::class, 'unarchiveSuratMasuk']);
        Route::post('surat-keluar/{id}/arsip', [ArsipActionController::class, 'archiveSuratKeluar']);
        Route::delete('surat-keluar/{id}/arsip', [ArsipActionController::class, 'unarchiveSuratKeluar']);

        Route::get('dashboard', [DashboardController::class, 'index']);

        // Route for generating letter numbers
        Route::post('nomor-surat/generate', [NomorSuratController::class, 'generate']);
    });
});