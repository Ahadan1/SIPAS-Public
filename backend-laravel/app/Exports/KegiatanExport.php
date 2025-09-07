<?php

namespace App\Exports;

use App\Models\Kegiatan;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class KegiatanExport implements FromQuery, WithHeadings, WithMapping
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
        $query = Kegiatan::query()
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
            'Link Youtube',
            'Dibuat Pada',
        ];
    }

    /**
     * @param Kegiatan $kegiatan
     * @return array
     */
    public function map($kegiatan): array
    {
        return [
            $kegiatan->id,
            $kegiatan->nama_kegiatan,
            $kegiatan->tanggal_kegiatan,
            $kegiatan->keterangan,
            $kegiatan->youtube_link,
            $kegiatan->created_at->format('d-m-Y H:i'),
        ];
    }
}
