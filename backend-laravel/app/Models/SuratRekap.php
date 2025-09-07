<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SuratRekap extends Model
{
    protected $fillable = [
        'tanggal',
        'tahun',
        'file_upload',
        'id_user',
        'kode_uk',
    ];
}
