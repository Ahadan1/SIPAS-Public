<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Arsip extends Model
{
    use HasFactory;

    protected $fillable = [
        'surat_type',
        'surat_id',
        'unit_kerja',
        'lokasi_fisik',
        'keterangan',
        'archived_by',
        'archived_at',
    ];

    protected $casts = [
        'archived_at' => 'datetime',
    ];

    public function surat(): MorphTo
    {
        return $this->morphTo();
    }

    public function archivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'archived_by');
    }
}
