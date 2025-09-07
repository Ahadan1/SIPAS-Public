<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JenisNaskah extends Model
{
    use HasFactory;

    protected $table = 'jenis_naskah';

    protected $fillable = [
        'nama_jenis',
        'deskripsi',
        'is_active',
    ];
}
