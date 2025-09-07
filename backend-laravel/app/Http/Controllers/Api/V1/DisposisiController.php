<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Disposisi;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\SuratMasuk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DisposisiController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Disposisi::class);

        $user = Auth::user();
        $type = $request->query('type'); // Default is null if not present

        $query = Disposisi::with(['suratMasuk.document', 'pengirim', 'penerima']);

        if ($type === 'sent') {
            $query->where('pengirim_id', $user->id);
        } elseif ($type === 'received') {
            $query->where('penerima_id', $user->id);
        } else {
            // If no type is specified, get all dispositions related to the user (sent or received)
            $query->where(function ($q) use ($user) {
                $q->where('pengirim_id', $user->id)
                  ->orWhere('penerima_id', $user->id);
            });
        }

        $disposisi = $query->latest()->paginate(10);

        return response()->json($disposisi);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $suratMasuk = SuratMasuk::findOrFail($request->surat_masuk_id);
        $this->authorize('create', [Disposisi::class, $suratMasuk]);

        $validator = Validator::make($request->all(), [
            'surat_masuk_id' => 'required|integer|exists:surat_masuk,id',
            'penerima_id' => 'required|integer|exists:users,id',
            'catatan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            DB::beginTransaction();

            $disposisi = Disposisi::create([
                'surat_masuk_id' => $request->surat_masuk_id,
                'penerima_id' => $request->penerima_id,
                'pengirim_id' => Auth::id(),
                'catatan' => $request->catatan,
                'status' => 'Dikirim',
            ]);

            // Update the status of the related SuratMasuk
            $suratMasuk = SuratMasuk::findOrFail($request->surat_masuk_id);
            $suratMasuk->status = 'Didisposisikan';
            $suratMasuk->save();

            DB::commit();

            return response()->json($disposisi->load(['pengirim', 'penerima']), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create disposisi', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Disposisi $disposisi)
    {
        $this->authorize('view', $disposisi);

        return response()->json($disposisi->load(['suratMasuk.document', 'pengirim', 'penerima']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Disposisi $disposisi)
    {
        $this->authorize('update', $disposisi);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Diterima,Ditolak',
            'catatan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $disposisi->update([
            'status' => $request->status,
            'catatan' => $request->filled('catatan') ? $request->catatan : $disposisi->catatan,
        ]);

        return response()->json($disposisi->load(['pengirim', 'penerima']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Disposisi $disposisi)
    {
        $this->authorize('delete', $disposisi);

        $disposisi->delete();

        return response()->json(null, 204);
    }
}
