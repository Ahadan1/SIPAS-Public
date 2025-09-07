<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tembusan extends Model
{
    use HasFactory;

    protected $table = 'tembusan';

    protected $fillable = [
        'document_id',
        'jabatan_id',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function jabatan()
    {
        return $this->belongsTo(Jabatan::class);
    }
}
