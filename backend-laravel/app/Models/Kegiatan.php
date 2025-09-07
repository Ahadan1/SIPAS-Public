<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\FotoKegiatan;

class Kegiatan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nama_kegiatan',
        'tanggal_kegiatan',
        'file_path',
        'youtube_link',
        'keterangan',
        'kode_uk',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function fotos()
    {
        return $this->hasMany(FotoKegiatan::class);
    }
}
