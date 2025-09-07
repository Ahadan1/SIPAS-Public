<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuratMasuk extends Model
{
    use HasFactory;

    protected $table = 'surat_masuk';

    protected $fillable = [
        'document_id',
        'tanggal_diterima',
        'asal_surat',
        'penerima_id',
        'status',
        'read_at',
        'read_by',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function penerima()
    {
        return $this->belongsTo(User::class, 'penerima_id');
    }
}
