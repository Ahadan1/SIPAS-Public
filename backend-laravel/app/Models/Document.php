<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'nomor_surat',
        'perihal',
        'tanggal_surat',
        'jenis_naskah_id',
        'klasifikasi_id',
        'user_id',
        'sifat_keamanan',
        'sifat_kecepatan',
        'ringkasan',
        'file_path',
    ];

    public function jenisNaskah()
    {
        return $this->belongsTo(JenisNaskah::class);
    }

    public function klasifikasi()
    {
        return $this->belongsTo(Klasifikasi::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
