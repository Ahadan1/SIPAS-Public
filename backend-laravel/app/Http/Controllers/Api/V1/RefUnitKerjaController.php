<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class RefUnitKerjaController extends Controller
{
    /**
     * Return a static list of Unit Kerja codes and labels.
     */
    public function index(): JsonResponse
    {
        $items = [
            // code => label
            ['code' => 'BAS',  'label' => 'BAS'],
            ['code' => 'BASI', 'label' => 'BAS Internal'],
            ['code' => 'SIL',  'label' => 'SIL'],
            ['code' => 'SKSG', 'label' => 'SKSG'],
            ['code' => 'KKS',  'label' => 'Komite SIL'],
            ['code' => 'KSK',  'label' => 'Komite SKSG'],
        ];

        return response()->json([
            'data' => $items,
        ]);
    }
}
