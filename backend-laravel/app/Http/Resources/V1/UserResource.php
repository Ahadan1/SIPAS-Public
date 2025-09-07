<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->nama,
            'username' => $this->username,
            // Use the user's own kode_uk as the Unit Kerja value
            'unit_kerja' => $this->kode_uk,
            'kode_uk' => $this->kode_uk,
            'jabatan' => $this->jabatan?->nama_jabatan,
            'level' => $this->level,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
