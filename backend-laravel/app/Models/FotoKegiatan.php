<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Kegiatan;

class FotoKegiatan extends Model
{
    use HasFactory;

    protected $fillable = [
        'kegiatan_id',
        'file_path',
    ];

    public function kegiatan()
    {
        return $this->belongsTo(Kegiatan::class);
    }
}
