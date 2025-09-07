<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

class UploadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(['message' => 'Upload endpoint ready']);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Accept multiple files and metadata from Upload tab
        $validated = $request->validate([
            'files' => 'required|array|min:1',
            'files.*' => 'file|max:51200|mimes:pdf,docx,xlsx,pptx', // 50MB per file
            // accept both snake_case and camelCase for robustness
            'document_title' => 'nullable|string',
            'documentTitle' => 'nullable|string',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'tags' => 'nullable|string', // comma-separated
        ]);

        $title = $request->input('document_title') ?? $request->input('documentTitle');
        $category = $request->input('category');
        $description = $request->input('description');
        $tagsRaw = $request->input('tags');
        $tags = [];
        if (is_string($tagsRaw)) {
            $tags = array_values(array_filter(array_map(static function ($t) {
                return trim($t);
            }, explode(',', $tagsRaw)), static function ($t) {
                return $t !== '';
            }));
        }

        if (!$request->hasFile('files')) {
            return response()->json(['message' => 'No files uploaded'], 400);
        }

        $now = Carbon::now();
        $year = $now->format('Y');
        $month = $now->format('m');
        $baseDir = "public/arsip-uploads/{$year}/{$month}";

        $uploaded = [];
        foreach ($request->file('files') as $idx => $file) {
            if (!$file->isValid()) {
                continue;
            }
            $orig = $file->getClientOriginalName();
            $ext = $file->getClientOriginalExtension();
            $safeTitle = $title ? preg_replace('/[^a-zA-Z0-9\-_.]/', '_', $title) : 'arsip';
            $fileName = $safeTitle . '-' . $now->format('ymdhis') . '-' . ($idx + 1) . '.' . $ext;
            $path = $file->storeAs($baseDir, $fileName);

            $uploaded[] = [
                'original_name' => $orig,
                'stored_name' => $fileName,
                'stored_path' => $path,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'url' => Storage::url($path),
            ];
        }

        if (empty($uploaded)) {
            return response()->json(['message' => 'No valid files uploaded'], 422);
        }

        // If needed, here is where you would persist a DB record referencing these uploads
        // For now, respond with metadata + uploaded files info
        return response()->json([
            'message' => 'Files uploaded successfully',
            'document' => [
                'title' => $title,
                'category' => $category,
                'description' => $description,
                'tags' => $tags,
                'uploaded_at' => $now->toISOString(),
            ],
            'files' => $uploaded,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json(['message' => 'Upload details endpoint']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        return response()->json(['message' => 'Upload update endpoint']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        return response()->json(['message' => 'Upload delete endpoint']);
    }
}
