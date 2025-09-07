<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Notulen extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nama_kegiatan',
        'tanggal_kegiatan',
        'file_path',
        'audio_path',
        'keterangan',
        'kode_uk',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
