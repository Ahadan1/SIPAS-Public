<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\NomorSuratService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NomorSuratController extends Controller
{
    protected $nomorSuratService;

    public function __construct(NomorSuratService $nomorSuratService)
    {
        $this->nomorSuratService = $nomorSuratService;
    }

    public function generate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'jenis_naskah_id' => 'required|integer|exists:jenis_naskah,id',
            'klasifikasi_id' => 'required|integer|exists:klasifikasi,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $result = $this->nomorSuratService->generate(
                $request->jenis_naskah_id,
                $request->klasifikasi_id
            );
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to generate nomor surat', 'error' => $e->getMessage()], 500);
        }
    }
}
