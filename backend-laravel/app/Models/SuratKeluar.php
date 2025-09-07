<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuratKeluar extends Model
{
    use HasFactory;

    protected $table = 'surat_keluars';
    protected $primaryKey = 'id_surat';

    protected $fillable = [
        'perihal',
        'tujuan',
        'no_urut',
        'no_surat',
        'kode_jenis',
        'kode_klasifikasi',
        'kode_penandatanganan',
        'tgl_surat',
        'tgl_catat',
        'file',
        'id_user',
        'kode_uk',
        'drafsurat',
        'ref_surat_masuk',
        'status',
        'created',
        'createdby',
        'updated',
        'updatedby',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    /**
     * Users as tujuan (single or multiple) via pivot table.
     */
    public function tujuanUsers()
    {
        // surat_keluar_id references this model's id_surat
        return $this->belongsToMany(User::class, 'surat_keluar_tujuan', 'surat_keluar_id', 'user_id', 'id_surat', 'id')
            ->withTimestamps();
    }
}
