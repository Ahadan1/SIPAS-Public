<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\SuratMasuk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class SuratMasukController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', SuratMasuk::class);

        $query = SuratMasuk::with('document')->latest();

        // Search functionality (based on legacy Arsip controller)
        $query->when($request->filled('search'), function ($q) use ($request) {
            $search = $request->input('search');
            $q->where(function($subQuery) use ($search) {
                $subQuery->where('asal_surat', 'like', "%{$search}%")
                         ->orWhereHas('document', function ($docQuery) use ($search) {
                             $docQuery->where('nomor_surat', 'like', "%{$search}%")
                                      ->orWhere('perihal', 'like', "%{$search}%");
                         });
            });
        });

        // Optional date range filter by tanggal_diterima
        if ($request->filled('tgl_awal') && $request->filled('tgl_akhir')) {
            $awal = $request->input('tgl_awal');
            $akhir = $request->input('tgl_akhir');
            $query->whereBetween('tanggal_diterima', [$awal, $akhir]);
        }

        $suratMasuk = $query->paginate($request->input('per_page', 10));

        return response()->json($suratMasuk);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', SuratMasuk::class);
        $validator = Validator::make($request->all(), [
            'nomor_surat' => 'required|string|max:255|unique:documents',
            'perihal' => 'required|string|max:255',
            'tanggal_surat' => 'required|date',
            'jenis_naskah_id' => 'required|exists:jenis_naskah,id',
            'klasifikasi_id' => 'required|exists:klasifikasi,id',
            'sifat_keamanan' => 'required|in:Biasa,Rahasia,Sangat Rahasia',
            'sifat_kecepatan' => 'required|in:Biasa,Segera,Sangat Segera',
            'file' => 'required|file|mimes:pdf,doc,docx|max:2048',
            'asal_surat' => 'required|string|max:255',
            'tanggal_diterima' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            DB::beginTransaction();

            $filePath = $request->file('file')->store('documents', 'public');

            $document = Document::create([
                'nomor_surat' => $request->nomor_surat,
                'perihal' => $request->perihal,
                'tanggal_surat' => $request->tanggal_surat,
                'jenis_naskah_id' => $request->jenis_naskah_id,
                'klasifikasi_id' => $request->klasifikasi_id,
                'user_id' => auth()->id(),
                'sifat_keamanan' => $request->sifat_keamanan,
                'sifat_kecepatan' => $request->sifat_kecepatan,
                'ringkasan' => $request->ringkasan,
                'file_path' => $filePath,
            ]);

            $suratMasuk = SuratMasuk::create([
                'document_id' => $document->id,
                'tanggal_diterima' => $request->tanggal_diterima,
                'asal_surat' => $request->asal_surat,
                'penerima_id' => auth()->id(), // Or a specific recipient
                'status' => 'Diterima',
            ]);

            DB::commit();

            return response()->json($suratMasuk->load('document'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create surat masuk', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(SuratMasuk $suratMasuk)
    {
        $this->authorize('view', $suratMasuk);
        return response()->json($suratMasuk->load('document'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SuratMasuk $suratMasuk)
    {
        $this->authorize('update', $suratMasuk);
        $validator = Validator::make($request->all(), [
            'nomor_surat' => 'sometimes|string|max:255|unique:documents,nomor_surat,' . $suratMasuk->document_id,
            'perihal' => 'sometimes|string|max:255',
            'tanggal_surat' => 'sometimes|date',
            'jenis_naskah_id' => 'sometimes|exists:jenis_naskah,id',
            'klasifikasi_id' => 'sometimes|exists:klasifikasi,id',
            'sifat_keamanan' => 'sometimes|in:Biasa,Rahasia,Sangat Rahasia',
            'sifat_kecepatan' => 'sometimes|in:Biasa,Segera,Sangat Segera',
            'file' => 'sometimes|file|mimes:pdf,doc,docx|max:2048',
            'asal_surat' => 'sometimes|string|max:255',
            'tanggal_diterima' => 'sometimes|date',
            'status' => 'sometimes|in:Diterima,Dibaca,Didisposisikan,Diarsipkan',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            DB::beginTransaction();

            $document = $suratMasuk->document;
            // Only update document fields that are present in the request
            $documentData = $request->only([
                'nomor_surat', 'perihal', 'tanggal_surat', 'jenis_naskah_id',
                'klasifikasi_id', 'sifat_keamanan', 'sifat_kecepatan', 'ringkasan'
            ]);

            if ($request->hasFile('file')) {
                // Delete old file
                Storage::disk('public')->delete($document->file_path);
                // Store new file
                $documentData['file_path'] = $request->file('file')->store('documents', 'public');
            }

            if (!empty($documentData)) {
                $document->update($documentData);
            }

            // Only update surat_masuk fields that are present
            $suratData = [];
            if ($request->has('tanggal_diterima')) {
                $suratData['tanggal_diterima'] = $request->input('tanggal_diterima');
            }
            if ($request->has('asal_surat')) {
                $suratData['asal_surat'] = $request->input('asal_surat');
            }
            if ($request->has('status')) {
                $suratData['status'] = $request->input('status');
            }
            if (!empty($suratData)) {
                $suratMasuk->update($suratData);
            }

            DB::commit();

            return response()->json($suratMasuk->load('document'));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update surat masuk', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SuratMasuk $suratMasuk)
    {
        $this->authorize('delete', $suratMasuk);
        try {
            DB::beginTransaction();

            $document = $suratMasuk->document;

            // Delete the file from storage
            Storage::disk('public')->delete($document->file_path);

            // The SuratMasuk record will be deleted automatically by the database
            // cascade rule when the parent Document is deleted.
            $document->delete();

            DB::commit();

            return response()->json(null, 204);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete surat masuk', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Mark surat masuk as read (Dibaca) and set read_at/read_by.
     */
    public function dibaca(SuratMasuk $suratMasuk)
    {
        $this->authorize('update', $suratMasuk);
        $suratMasuk->update([
            'status' => 'Dibaca',
            'read_at' => Carbon::now(),
            'read_by' => auth()->id(),
        ]);
        return response()->json($suratMasuk->fresh()->load('document'));
    }

    /**
     * Mark surat masuk as unread (Diterima baseline), clear read_at/read_by.
     */
    public function belum(SuratMasuk $suratMasuk)
    {
        $this->authorize('update', $suratMasuk);
        $suratMasuk->update([
            'status' => 'Diterima',
            'read_at' => null,
            'read_by' => null,
        ]);
        return response()->json($suratMasuk->fresh()->load('document'));
    }
}
