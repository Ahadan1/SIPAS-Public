<?php

namespace App\Exports;

use App\Models\Notulen;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class NotulenExport implements FromQuery, WithHeadings, WithMapping
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function query()
    {
        $user = Auth::user();
        $query = Notulen::query()
            ->where('kode_uk', $user->jabatan->kode_uk)
            ->whereBetween('tanggal_kegiatan', [$this->startDate, $this->endDate]);

        return $query;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Nama Kegiatan',
            'Tanggal Kegiatan',
            'Keterangan',
            'Dibuat Pada',
        ];
    }

    /**
     * @param Notulen $notulen
     * @return array
     */
    public function map($notulen): array
    {
        return [
            $notulen->id,
            $notulen->nama_kegiatan,
            $notulen->tanggal_kegiatan,
            $notulen->keterangan,
            $notulen->created_at->format('d-m-Y H:i'),
        ];
    }
}
