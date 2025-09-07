<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RefJenisNaskah extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'nama',
        'kode',
        'uraian',
    ];
}
