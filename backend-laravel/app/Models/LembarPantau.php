<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LembarPantau extends Model
{
    protected $fillable = [
        'id_surat',
        'id_jabatan',
        'catatan',
        'tgl_paraf',
        'tgl_input',
    ];
}
