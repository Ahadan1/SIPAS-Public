<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tembusan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TembusanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Tembusan::with('jabatan');

        if ($request->has('document_id')) {
            $query->where('document_id', $request->document_id);
        }

        $tembusan = $query->get();
        return response()->json($tembusan);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'document_id' => 'required|integer|exists:documents,id',
            'jabatan_id' => 'required|integer|exists:jabatan,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Prevent duplicate entries
        $existing = Tembusan::where('document_id', $request->document_id)
            ->where('jabatan_id', $request->jabatan_id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Tembusan already exists for this document and jabatan.'], 409);
        }

        $tembusan = Tembusan::create($request->all());

        return response()->json($tembusan->load('jabatan'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tembusan $tembusan)
    {
        return response()->json($tembusan->load('jabatan'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tembusan $tembusan)
    {
        $validator = Validator::make($request->all(), [
            'document_id' => 'sometimes|required|integer|exists:documents,id',
            'jabatan_id' => 'sometimes|required|integer|exists:jabatan,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Prevent duplicate entries on update
        if ($request->has('document_id') && $request->has('jabatan_id')) {
            $existing = Tembusan::where('document_id', $request->document_id)
                ->where('jabatan_id', $request->jabatan_id)
                ->where('id', '!=', $tembusan->id)
                ->first();

            if ($existing) {
                return response()->json(['message' => 'Tembusan already exists for this document and jabatan.'], 409);
            }
        }

        $tembusan->update($request->all());

        return response()->json($tembusan->load('jabatan'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tembusan $tembusan)
    {
        $tembusan->delete();
        return response()->json(null, 204);
    }
}
