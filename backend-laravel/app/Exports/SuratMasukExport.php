<?php

namespace App\Exports;

use App\Models\SuratMasuk;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SuratMasukExport implements FromQuery, WithHeadings, WithMapping
{
    protected $tglAwal;
    protected $tglAkhir;

    public function __construct($tglAwal, $tglAkhir)
    {
        $this->tglAwal = $tglAwal;
        $this->tglAkhir = $tglAkhir;
    }

    public function query()
    {
        return SuratMasuk::query()
            ->with('document', 'klasifikasi')
            ->whereHas('document', function ($query) {
                $query->whereBetween('tanggal_surat', [$this->tglAwal, $this->tglAkhir]);
            });
    }

    public function headings(): array
    {
        return [
            'No. Agenda',
            'Asal Surat',
            'Nomor Surat',
            'Tanggal Surat',
            'Perihal',
            'Klasifikasi',
            'Tanggal Diterima',
        ];
    }

    public function map($suratMasuk): array
    {
        return [
            $suratMasuk->document->nomor_agenda,
            $suratMasuk->asal_surat,
            $suratMasuk->document->nomor_surat,
            $suratMasuk->document->tanggal_surat,
            $suratMasuk->document->perihal,
            $suratMasuk->klasifikasi->nama,
            $suratMasuk->tanggal_diterima,
        ];
    }
}
