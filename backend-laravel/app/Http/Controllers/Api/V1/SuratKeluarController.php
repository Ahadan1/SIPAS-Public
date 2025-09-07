<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Controllers\Controller;
use App\Models\SuratKeluar;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Services\NomorSuratService;
use App\Models\JenisNaskah;
use App\Models\Klasifikasi;

class SuratKeluarController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', SuratKeluar::class);

        $query = SuratKeluar::with(['user','tujuanUsers'])->latest('tgl_catat');

        if ($request->filled('kode_uk')) {
            $query->where('kode_uk', $request->kode_uk);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        // Optional date range by tgl_surat
        if ($request->filled('tgl_awal') && $request->filled('tgl_akhir')) {
            $query->whereBetween('tgl_surat', [
                $request->input('tgl_awal'),
                $request->input('tgl_akhir'),
            ]);
        }
        // Optional search by perihal or no_surat
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('perihal', 'like', "%{$search}%")
                  ->orWhere('no_surat', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        $data = $query->paginate($perPage);
        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', SuratKeluar::class);
        // Normalize camelCase keys from frontend to match backend validation/columns
        $request->merge([
            'tujuan_user_ids' => $request->input('tujuan_user_ids', $request->input('tujuanUsers', [])),
            'tgl_surat' => $request->input('tgl_surat', $request->input('tglSurat')),
            'no_surat' => $request->input('no_surat', $request->input('noSurat')),
            'kode_jenis' => $request->input('kode_jenis', $request->input('jenisSurat', $request->input('kodeJenis'))),
            'kode_klasifikasi' => $request->input('kode_klasifikasi', $request->input('klasifikasi', $request->input('kodeKlasifikasi'))),
            'kode_penandatanganan' => $request->input('kode_penandatanganan', $request->input('penandatangan', $request->input('kodePenandatanganan'))),
            'kode_uk' => $request->input('kode_uk', $request->input('unitKerja', $request->input('kodeUk'))),
            'drafsurat' => $request->input('drafsurat', $request->input('drafSurat')),
            'ref_surat_masuk' => $request->input('ref_surat_masuk', $request->input('refSuratMasuk')),
        ]);
        $validated = $request->validate([
            'perihal' => 'required|string',
            'tujuan' => 'nullable|string',
            'tujuan_user_ids' => 'array',
            'tujuan_user_ids.*' => 'integer|exists:users,id',
            'no_surat' => 'nullable|string',
            'kode_jenis' => 'required|string',
            'kode_klasifikasi' => 'required|string',
            'kode_penandatanganan' => 'required|string',
            'tgl_surat' => 'required|date',
            'file' => 'nullable|file',
            'kode_uk' => 'required|string',
            'drafsurat' => 'nullable|string',
            'ref_surat_masuk' => 'nullable|integer',
        ]);
        $fileName = null;
        if ($request->hasFile('file')) {
            $ext = $request->file('file')->getClientOriginalExtension();
            $fileName = 'surat_keluar-' . Carbon::now()->format('ymdhis') . '.' . $ext;
            $request->file('file')->storeAs('public/surat_keluar', $fileName);
        }
        // Generate no_urut and no_surat (respect incoming no_surat if provided)
        $no_urut = null;
        $no_surat = null;
        if ($request->filled('no_surat')) {
            $no_surat = (string) $request->string('no_surat');
            // Still ensure no_urut is populated even if client supplies no_surat
            try {
                $jenis = JenisNaskah::where('kode', $validated['kode_jenis'])->first();
                $klas = Klasifikasi::where('kode', $validated['kode_klasifikasi'])->first();
                if ($jenis && $klas) {
                    $gen = app(NomorSuratService::class)->generate($jenis->id, $klas->id);
                    $no_urut = $gen['nomor_urut'] ?? null;
                }
            } catch (\Throwable $e) {
                // fallback below
            }
            if (!$no_urut) {
                // Fallback: next sequence within current year
                $currentYear = Carbon::now()->year;
                $last = SuratKeluar::whereYear('tgl_catat', $currentYear)->max('no_urut');
                $no_urut = (int) ($last ?? 0) + 1;
            }
        } else {
            // Try to generate using NomorSuratService based on kode_jenis and kode_klasifikasi
            try {
                $jenis = JenisNaskah::where('kode', $validated['kode_jenis'])->first();
                $klas = Klasifikasi::where('kode', $validated['kode_klasifikasi'])->first();
                if ($jenis && $klas) {
                    $gen = app(NomorSuratService::class)->generate($jenis->id, $klas->id);
                    $no_urut = $gen['nomor_urut'] ?? null;
                    $no_surat = $gen['nomor_surat'] ?? null;
                }
            } catch (\Throwable $e) {
                // fallback below
            }
            if (!$no_surat) {
                $no_urut = $no_urut ?? rand(100, 999);
                $th = Carbon::now()->format('Y');
                $no_surat = $no_urut.' Tahun '.$th;
            }
        }
        $authUser = $request->user();
        $surat = SuratKeluar::create([
            'perihal' => $validated['perihal'],
            // Keep empty string if not provided to satisfy non-nullable column
            'tujuan' => $validated['tujuan'] ?? '',
            'no_urut' => $no_urut,
            'no_surat' => (string) $no_surat,
            'kode_jenis' => $validated['kode_jenis'],
            'kode_klasifikasi' => $validated['kode_klasifikasi'],
            'kode_penandatanganan' => $validated['kode_penandatanganan'],
            'tgl_surat' => $validated['tgl_surat'],
            'tgl_catat' => Carbon::now()->toDateString(),
            'file' => $fileName,
            'id_user' => $authUser?->id,
            'kode_uk' => $validated['kode_uk'],
            'drafsurat' => $validated['drafsurat'] ?? null,
            'ref_surat_masuk' => $validated['ref_surat_masuk'] ?? null,
            'status' => 'proses',
            'created' => Carbon::now(),
            'createdby' => ($authUser?->username) ?? ($authUser?->name) ?? 'system',
        ]);
        // Sync tujuan users if provided
        if (!empty($validated['tujuan_user_ids'])) {
            $surat->tujuanUsers()->sync($validated['tujuan_user_ids']);
        }
        return response()->json($surat->load(['user','tujuanUsers']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(SuratKeluar $suratKeluar)
    {
        $this->authorize('view', $suratKeluar);
        return response()->json($suratKeluar->load(['user','tujuanUsers']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SuratKeluar $suratKeluar)
    {
        $this->authorize('update', $suratKeluar);
        // Normalize camelCase keys from frontend to match backend validation/columns
        $request->merge([
            'tujuan_user_ids' => $request->input('tujuan_user_ids', $request->input('tujuanUsers', [])),
            'tgl_surat' => $request->input('tgl_surat', $request->input('tglSurat')),
            'no_surat' => $request->input('no_surat', $request->input('noSurat')),
            'kode_jenis' => $request->input('kode_jenis', $request->input('jenisSurat', $request->input('kodeJenis'))),
            'kode_klasifikasi' => $request->input('kode_klasifikasi', $request->input('klasifikasi', $request->input('kodeKlasifikasi'))),
            'kode_penandatanganan' => $request->input('kode_penandatanganan', $request->input('penandatangan', $request->input('kodePenandatanganan'))),
            'kode_uk' => $request->input('kode_uk', $request->input('unitKerja', $request->input('kodeUk'))),
            'drafsurat' => $request->input('drafsurat', $request->input('drafSurat')),
            'ref_surat_masuk' => $request->input('ref_surat_masuk', $request->input('refSuratMasuk')),
        ]);
        $validated = $request->validate([
            'perihal' => 'sometimes|required|string',
            'tujuan' => 'sometimes|nullable|string',
            'tujuan_user_ids' => 'sometimes|array',
            'tujuan_user_ids.*' => 'integer|exists:users,id',
            'no_surat' => 'sometimes|nullable|string',
            'kode_jenis' => 'sometimes|required|string',
            'kode_klasifikasi' => 'sometimes|required|string',
            'kode_penandatanganan' => 'sometimes|required|string',
            'tgl_surat' => 'sometimes|required|date',
            'file' => 'nullable|file',
            'kode_uk' => 'sometimes|required|string',
            'drafsurat' => 'nullable|string',
            'ref_surat_masuk' => 'nullable|integer',
        ]);
        $data = $validated;
        if ($request->hasFile('file')) {
            $ext = $request->file('file')->getClientOriginalExtension();
            $fileName = 'surat_keluar-' . Carbon::now()->format('ymdhis') . '.' . $ext;
            $request->file('file')->storeAs('public/surat_keluar', $fileName);
            $data['file'] = $fileName;
        }
        $data['updated'] = Carbon::now();
        $data['updatedby'] = ($request->user()?->username) ?? ($request->user()?->name) ?? 'system';
        $suratKeluar->update($data);
        if (array_key_exists('tujuan_user_ids', $validated)) {
            $suratKeluar->tujuanUsers()->sync($validated['tujuan_user_ids'] ?? []);
        }
        return response()->json($suratKeluar->load(['user','tujuanUsers']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SuratKeluar $suratKeluar)
    {
        $this->authorize('delete', $suratKeluar);
        if ($suratKeluar->file) {
            Storage::delete('public/surat_keluar/' . $suratKeluar->file);
        }
        $suratKeluar->delete();
        return response()->json(null, 204);
    }

    public function diarsipkan($id)
    {
        $surat = SuratKeluar::where('id_surat', $id)->firstOrFail();
        $surat->status = 'close';
        $surat->save();
        return response()->json(['status' => 1, 'id' => $id, 'pesan' => 'Surat berhasil diarsipkan!']);
    }
}
