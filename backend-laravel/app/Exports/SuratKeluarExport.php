<?php

namespace App\Exports;

use App\Models\SuratKeluar;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SuratKeluarExport implements FromQuery, WithHeadings, WithMapping
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
        return SuratKeluar::query()
            ->with('document', 'klasifikasi', 'user')
            ->whereHas('document', function ($query) {
                $query->whereBetween('tanggal_surat', [$this->tglAwal, $this->tglAkhir]);
            });
    }

    public function headings(): array
    {
        return [
            'No. Surat',
            'Tanggal Surat',
            'Tanggal Input',
            'Dibuat Oleh',
            'Perihal',
            'Tujuan',
            'Jenis Surat',
        ];
    }

    public function map($suratKeluar): array
    {
        return [
            $suratKeluar->document->nomor_surat,
            $suratKeluar->document->tanggal_surat,
            $suratKeluar->created_at->format('Y-m-d'),
            $suratKeluar->user->name,
            $suratKeluar->document->perihal,
            $suratKeluar->tujuan_surat,
            $suratKeluar->document->jenisNaskah->nama,
        ];
    }
}
