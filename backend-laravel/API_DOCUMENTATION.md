# SIPAS Backend API Documentation

This document provides a complete list of all available API endpoints for the SIPAS application. All endpoints under the `/api/v1/` prefix require a valid Bearer Token in the `Authorization` header, obtained from the `/api/login` endpoint.

---

## Authentication

### `POST /api/login`
- **Description:** Authenticates a user and returns a Sanctum API token.
- **Requires Auth:** No
- **Request Body:**
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```

### `POST /api/logout`
- **Description:** Logs out the authenticated user and invalidates the token.
- **Requires Auth:** Yes

### `GET /api/user`
- **Description:** Retrieves the currently authenticated user's information.
- **Requires Auth:** Yes

---

## Arsip (Archive)
- **Controller:** `ArsipController`
- **Description:** Provides a read-only endpoint to search and filter across all archived mail (both incoming and outgoing).
- **Endpoints:**
  - `GET /api/v1/arsip`: Search/filter the archive.
    - **Query Parameters Example:** `?type=surat_masuk&keyword=penting&start_date=2025-01-01&end_date=2025-03-31`
    - **Parameters:**
      - `type` (optional): `surat_masuk` or `surat_keluar`. If not provided, searches both.
      - `keyword` (optional): Search term for `perihal`, `nomor_surat`, or `ringkasan`.
      - `start_date` (optional): Format `YYYY-MM-DD`.
      - `end_date` (optional): Format `YYYY-MM-DD`.
  - `GET /api/v1/arsip/{arsip}`: Show a specific archive (Not yet implemented).

---

## Surat Masuk (Incoming Mail)
- **Controller:** `SuratMasukController`
- **Endpoints:**
  - `GET /api/v1/surat-masuk`: List all incoming mail.
  - `POST /api/v1/surat-masuk`: Create new incoming mail.
    - **Request Body (multipart/form-data):**
      ```json
      {
        "nomor_surat": "123/UN/IV/2025", // required, string
        "perihal": "Undangan Rapat Koordinasi", // required, string
        "tanggal_surat": "2025-04-15", // required, date
        "jenis_naskah_id": 1, // required, integer
        "klasifikasi_id": 1, // required, integer
        "sifat_keamanan": "Biasa", // required, enum: 'Biasa', 'Rahasia', 'Sangat Rahasia'
        "sifat_kecepatan": "Segera", // required, enum: 'Biasa', 'Segera', 'Sangat Segera'
        "asal_surat": "Universitas Negeri", // required, string
        "tanggal_diterima": "2025-04-16", // required, date
        "ringkasan": "Ringkasan singkat mengenai isi surat undangan.", // optional, string
        "file": "(binary)" // required, file (pdf, doc, docx)
      }
      ```
    - **Note:** The `file` must be sent as `multipart/form-data`.
  - `GET /api/v1/surat-masuk/{surat_masuk}`: Show specific incoming mail.
  - `PUT/PATCH /api/v1/surat-masuk/{surat_masuk}`: Update specific incoming mail.
    - **Request Body:** (Similar to POST)
  - `DELETE /api/v1/surat-masuk/{surat_masuk}`: Delete specific incoming mail.

---

## Surat Keluar (Outgoing Mail)
- **Controller:** `SuratKeluarController`
- **Endpoints:**
  - `GET /api/v1/surat-keluar`: List all outgoing mail.
  - `POST /api/v1/surat-keluar`: Create new outgoing mail.
    - **Request Body (multipart/form-data):**
      ```json
      {
        "perihal": "Pemberitahuan Libur Nasional", // required, string
        "tujuan": "Seluruh Karyawan", // required, string
        "kode_jenis": "SK", // required, string
        "kode_klasifikasi": "ADM", // required, string
        "kode_penandatanganan": "DIR", // required, string
        "tgl_surat": "2025-08-10", // required, date
        "file": "(binary)", // optional, file (pdf, doc, docx)
        "kode_uk": "BAS", // required, string
        "drafsurat": "Draft surat pemberitahuan...", // optional, string
        "ref_surat_masuk": 1 // optional, integer
      }
      ```
    - **Note:** The `file` must be sent as `multipart/form-data`.
  - `GET /api/v1/surat-keluar/{surat_keluar}`: Show specific outgoing mail.
  - `PUT/PATCH /api/v1/surat-keluar/{surat_keluar}`: Update specific outgoing mail.
    - **Request Body:** (Similar to POST)
  - `DELETE /api/v1/surat-keluar/{surat_keluar}`: Delete specific outgoing mail.
  - `PATCH /api/v1/surat-keluar/{id}/diarsipkan`: Archive specific outgoing mail.

---

## Surat Rekap (Letter Summary)
- **Controller:** `SuratRekapController`
- **Endpoints:**
  - `GET /api/v1/surat-rekap`: List all letter summaries.
  - `POST /api/v1/surat-rekap`: Create new letter summary.
    - **Request Body (multipart/form-data):**
      ```json
      {
        "tanggal": "2025-08-04", // required, date
        "tahun": "2025", // required, string
        "file": "(binary)", // optional, file
        "kode_uk": "BAS" // required, string
      }
      ```
  - `GET /api/v1/surat-rekap/{surat_rekap}`: Show specific letter summary.
  - `PUT/PATCH /api/v1/surat-rekap/{surat_rekap}`: Update specific letter summary.
  - `DELETE /api/v1/surat-rekap/{surat_rekap}`: Delete specific letter summary.

---

## Lembar Pantau (Monitoring Sheet)
- **Controller:** `LembarPantauController`
- **Endpoints:**
  - `GET /api/v1/lembar-pantau`: List all monitoring sheets.
    - **Query Parameters:** `?id_surat=1` (optional filter by letter ID)
  - `POST /api/v1/lembar-pantau`: Create new monitoring sheet.
    - **Request Body:**
      ```json
      {
        "id_surat": 1, // required, integer
        "id_jabatan": 2, // required, integer
        "catatan": "Catatan monitoring", // optional, string
        "tgl_paraf": "2025-08-04", // required, date
        "tgl_input": "2025-08-04" // required, date
      }
      ```
  - `GET /api/v1/lembar-pantau/{lembar_pantau}`: Show specific monitoring sheet.
  - `PUT/PATCH /api/v1/lembar-pantau/{lembar_pantau}`: Update specific monitoring sheet.
  - `DELETE /api/v1/lembar-pantau/{lembar_pantau}`: Delete specific monitoring sheet.

---

## Dashboard
- **Controller:** `DashboardController`
- **Endpoints:**
  - `GET /api/v1/dashboard`: Get dashboard metrics.

---

## Disposisi (Disposition)
- **Controller:** `DisposisiController`
- **Endpoints:**
  - `GET /api/v1/disposisi`: List all dispositions.
  - `POST /api/v1/disposisi`: Create a new disposition.
    - **Request Body:**
      ```json
      {
        "surat_masuk_id": 1, // required, integer
        "penerima_id": 2, // required, integer (ID of the user receiving the disposition)
        "instruksi": "Mohon segera ditindaklanjuti.", // required, string
        "catatan": "Perhatikan batas waktu yang tertera di surat." // optional, string
      }
      ```
  - `GET /api/v1/disposisi/{disposisi}`: Show a specific disposition.
  - `PUT/PATCH /api/v1/disposisi/{disposisi}`: Update a specific disposition.
    - **Request Body:** (Same as POST, all fields are optional for PATCH)
  - `DELETE /api/v1/disposisi/{disposisi}`: Delete a specific disposition.

---

## Jabatan (Position)
- **Controller:** `JabatanController`
- **Endpoints:**
  - `GET /api/v1/jabatan`: List all positions.
  - `POST /api/v1/jabatan`: Create a new position.
    - **Request Body:**
      ```json
      {
        "nama_jabatan": "Kepala Bagian Akademik", // required, string, unique
        "kode_uk": "AKD", // required, string (work unit code)
        "level_hierarki": 3 // required, integer (for disposition hierarchy)
      }
      ```
  - `GET /api/v1/jabatan/{jabatan}`: Show a specific position.
  - `PUT/PATCH /api/v1/jabatan/{jabatan}`: Update a specific position.
    - **Request Body:** (Same as POST, all fields are optional for PATCH)
  - `DELETE /api/v1/jabatan/{jabatan}`: Delete a specific position.

---

## Jenis Naskah (Document Type)
- **Controller:** `JenisNaskahController`
- **Endpoints:**
  - `GET /api/v1/jenis-naskah`: List all document types.
  - `POST /api/v1/jenis-naskah`: Create a new document type.
    - **Request Body:**
      ```json
      {
        "nama_jenis": "Surat Edaran", // required, string, unique
        "deskripsi": "Digunakan untuk pemberitahuan yang bersifat umum dan internal.", // optional, string
        "is_active": true // optional, boolean
      }
      ```
  - `GET /api/v1/jenis-naskah/{jenis_naskah}`: Show a specific document type.
  - `PUT/PATCH /api/v1/jenis-naskah/{jenis_naskah}`: Update a specific document type.
    - **Request Body:** (Same as POST, all fields are optional for PATCH)
  - `DELETE /api/v1/jenis-naskah/{jenis_naskah}`: Delete a specific document type.

---

## Klasifikasi (Classification)
- **Controller:** `KlasifikasiController`
- **Endpoints:**
  - `GET /api/v1/klasifikasi`: List all classifications.
  - `POST /api/v1/klasifikasi`: Create a new classification.
    - **Request Body:**
      ```json
      {
        "kode_klasifikasi": "KU.01.01", // required, string, unique
        "nama_klasifikasi": "Surat Keuangan Internal", // required, string
        "deskripsi": "Klasifikasi untuk surat-surat yang berkaitan dengan keuangan internal." // optional, string
      }
      ```
  - `GET /api/v1/klasifikasi/{klasifikasi}`: Show a specific classification.
  - `PUT/PATCH /api/v1/klasifikasi/{klasifikasi}`: Update a specific classification.
    - **Request Body:** (Same as POST, all fields are optional for PATCH)
  - `DELETE /api/v1/klasifikasi/{klasifikasi}`: Delete a specific classification.

---

## Kegiatan (Activity)
- **Controller:** `KegiatanController`
- **Endpoints:**
  - `GET /api/v1/kegiatan`: List all activities.
  - `POST /api/v1/kegiatan`: Create a new activity.
    - **Request Body (multipart/form-data):**
      ```json
      {
        "nama_kegiatan": "Workshop Kurikulum 2025", // required, string
        "tanggal_kegiatan": "2025-08-20", // required, date
        "kode_uk": "AKD", // required, string (work unit code)
        "keterangan": "Workshop persiapan implementasi kurikulum baru.", // optional, string
        "youtube_link": "https://www.youtube.com/watch?v=example", // optional, url
        "main_file": "(binary)", // optional, file (pdf, doc, docx)
        "photos[]": "(binary)" // optional, array of image files
      }
      ```
  - `GET /api/v1/kegiatan/{kegiatan}`: Show a specific activity.
  - `PUT/PATCH /api/v1/kegiatan/{kegiatan}`: Update a specific activity.
    - **Request Body:** (Same as POST, all fields are optional for PATCH)
  - `DELETE /api/v1/kegiatan/{kegiatan}`: Delete a specific activity.

---

## Laporan (Reports)
- **Controllers:** `LaporanSuratController`, `LaporanKegiatanController`, `LaporanNotulenController`
- **Endpoints:**
  - `GET /api/v1/laporan/surat-keluar?tgl_awal=2025-01-01&tgl_akhir=2025-01-31`: Export outgoing mail report to Excel.
  - `GET /api/v1/laporan/surat-masuk?tgl_awal=2025-01-01&tgl_akhir=2025-01-31`: Export incoming mail report to Excel.
  - `GET /api/v1/laporan/kegiatan?start_date=2025-01-01&end_date=2025-01-31`: Export activity report to Excel. Requires `start_date` and `end_date`.
  - `GET /api/v1/laporan/notulen?start_date=2025-01-01&end_date=2025-01-31`: Export meeting minutes report to Excel. Requires `start_date` and `end_date`.

---

## Nomor Surat (Letter Number)
- **Controller:** `NomorSuratController`
- **Endpoints:**
  - `POST /api/v1/nomor-surat/generate`: Generate a new letter number.
    - **Request Body:**
      ```json
      {
        "jenis_naskah_id": 1, // required, integer
        "klasifikasi_id": 2 // required, integer
      }
      ```

---

## Notulen (Meeting Minutes)
- **Controller:** `NotulenController`
- **Endpoints:**
  - `GET /api/v1/notulen`: List all meeting minutes.
  - `POST /api/v1/notulen`: Create new meeting minutes.
    - **Request Body (multipart/form-data):**
      ```json
      {
        "nama_kegiatan": "Rapat Tinjauan Manajemen", // required, string
        "tanggal_kegiatan": "2025-08-01", // required, date
        "keterangan": "Pembahasan audit internal semester 1.", // optional, string
        "file": "(binary)", // optional, file (pdf, doc, docx)
        "audio": "(binary)" // optional, file (mp3, wav, m4a)
      }
      ```
  - `GET /api/v1/notulen/{notulen}`: Show specific meeting minutes.
  - `PUT/PATCH /api/v1/notulen/{notulen}`: Update specific meeting minutes.
    - **Request Body:** (Same as POST)
  - `DELETE /api/v1/notulen/{notulen}`: Delete specific meeting minutes.

---

## Referensi (References)

### Ref Jenis Naskah (Document Type Reference)
- **Controller:** `RefJenisNaskahController`
- **Endpoints:**
  - `GET /api/v1/ref-jenis-naskah`: List all document type references.
  - `POST /api/v1/ref-jenis-naskah`: Create a new document type reference.
    - **Request Body:**
      ```json
      {
        "nama": "Surat Keputusan", // required, string
        "kode": "SK", // required, string, unique
        "uraian": "Surat keputusan resmi dari pimpinan" // optional, string
      }
      ```
  - `GET /api/v1/ref-jenis-naskah/{ref_jenis_naskah}`: Show a specific document type reference.
  - `PUT/PATCH /api/v1/ref-jenis-naskah/{ref_jenis_naskah}`: Update a specific document type reference.
    - **Request Body:** (Same as POST, all fields are optional for PATCH)
  - `DELETE /api/v1/ref-jenis-naskah/{ref_jenis_naskah}`: Delete a specific document type reference.

### Ref Jabatan (Position Reference)
- **Controller:** `RefJabatanController`
- **Endpoints:**
  - `GET /api/v1/ref-jabatan`: List all position references.
  - `POST /api/v1/ref-jabatan`: Create a new position reference.
    - **Request Body:**
      ```json
      {
        "nama": "Kepala Departemen", // required, string
        "kode": "KADEP", // required, string, unique
        "uraian": "Kepala departemen IT" // optional, string
      }
      ```
  - `GET /api/v1/ref-jabatan/{ref_jabatan}`: Show a specific position reference.
  - `PUT/PATCH /api/v1/ref-jabatan/{ref_jabatan}`: Update a specific position reference.
    - **Request Body:** (Same as POST, all fields are optional for PATCH)
  - `DELETE /api/v1/ref-jabatan/{ref_jabatan}`: Delete a specific position reference.

### Ref Klasifikasi (Classification Reference)
- **Controller:** `RefKlasifikasiController`
- **Endpoints:**
  - `GET /api/v1/ref-klasifikasi`: List all classification references.
  - `POST /api/v1/ref-klasifikasi`: Create a new classification reference.
    - **Request Body:**
      ```json
      {
        "nama": "Administrasi", // required, string
        "kode": "ADM", // required, string, unique
        "uraian": "Klasifikasi surat administrasi" // optional, string
      }
      ```
  - `GET /api/v1/ref-klasifikasi/{ref_klasifikasi}`: Show a specific classification reference.
  - `PUT/PATCH /api/v1/ref-klasifikasi/{ref_klasifikasi}`: Update a specific classification reference.
    - **Request Body:** (Same as POST, all fields are optional for PATCH)
  - `DELETE /api/v1/ref-klasifikasi/{ref_klasifikasi}`: Delete a specific classification reference.

### Ref Tujuan (Destination Reference)
- **Controller:** `RefTujuanController`
- **Endpoints:**
  - `GET /api/v1/ref-tujuan`: List all destination references.
  - `POST /api/v1/ref-tujuan`: Create a new destination reference.
    - **Request Body:**
      ```json
      {
        "nama": "Internal", // required, string
        "kode": "INT", // required, string, unique
        "uraian": "Surat untuk internal organisasi" // optional, string
      }
      ```
  - `GET /api/v1/ref-tujuan/{ref_tujuan}`: Show a specific destination reference.
  - `PUT/PATCH /api/v1/ref-tujuan/{ref_tujuan}`: Update a specific destination reference.
    - **Request Body:** (Same as POST, all fields are optional for PATCH)
  - `DELETE /api/v1/ref-tujuan/{ref_tujuan}`: Delete a specific destination reference.

### Ref Disposisi
- **Controller:** `RefDisposisiController`
- **Endpoints:**
  - `GET /api/v1/ref-disposisi`: List all disposition references.
  - `POST /api/v1/ref-disposisi`: Create a new disposition reference.
    - **Request Body:**
      ```json
      {
        "nama": "Untuk ditindaklanjuti" // required, string, unique
      }
      ```
  - `GET /api/v1/ref-disposisi/{ref_disposisi}`: Show a specific disposition reference.
  - `PUT/PATCH /api/v1/ref-disposisi/{ref_disposisi}`: Update a specific disposition reference.
    - **Request Body:** (Same as POST, all fields are optional for PATCH)
  - `DELETE /api/v1/ref-disposisi/{ref_disposisi}`: Delete a specific disposition reference.

### Ref Penandatanganan (Signatory)
- **Controller:** `RefPenandatangananController`
- **Endpoints:**
  - `GET /api/v1/ref-penandatanganan`: List all signatory references.
  - `POST /api/v1/ref-penandatanganan`: Create a new signatory reference.
    - **Request Body:**
      ```json
      {
        "nama": "Direktur Politeknik", // required, string, unique
        "jabatan": "Direktur" // required, string
      }
      ```
  - `GET /api/v1/ref-penandatanganan/{ref_penandatanganan}`: Show a specific signatory reference.
  - `PUT/PATCH /api/v1/ref-penandatanganan/{ref_penandatanganan}`: Update a specific signatory reference.
    - **Request Body:** (Same as POST, all fields are optional for PATCH)
  - `DELETE /api/v1/ref-penandatanganan/{ref_penandatanganan}`: Delete a specific signatory reference.

---

## Upload
- **Controller:** `UploadController`
- **Endpoints:**
  - `POST /api/v1/upload`: Upload a file.
    - **Request Body (multipart/form-data):**
      ```json
      {
        "file": "(binary)", // required, file
        "type": "surat_keluar" // required, string (surat_keluar, surat_masuk, kegiatan, notulen)
      }
      ```
    - **Response:**
      ```json
      {
        "message": "File uploaded successfully",
        "file_name": "surat_keluar-250804123456.pdf",
        "file_path": "public/surat_keluar/surat_keluar-250804123456.pdf",
        "file_size": 12345,
        "file_type": "application/pdf"
      }
      ```

---

## Tembusan (Carbon Copy)
- **Controller:** `TembusanController`
- **Endpoints:**
  - `GET /api/v1/tembusan`: List all carbon copies.
  - `POST /api/v1/tembusan`: Create a new carbon copy.
  - `GET /api/v1/tembusan/{tembusan}`: Show a specific carbon copy.
  - `PUT/PATCH /api/v1/tembusan/{tembusan}`: Update a specific carbon copy.
    - **Request Body:** (Same as POST, all fields are optional for PATCH)
  - `DELETE /api/v1/tembusan/{tembusan}`: Delete a specific carbon copy.

---

## Tujuan (Destination/Recipient)
- **Controller:** `TujuanController`
- **Endpoints:**
  - `GET /api/v1/tujuan`: List all recipients.
  - `POST /api/v1/tujuan`: Create a new recipient.
  - `GET /api/v1/tujuan/{tujuan}`: Show a specific recipient.
  - `PUT/PATCH /api/v1/tujuan/{tujuan}`: Update a specific recipient.
    - **Request Body:** (Same as POST, all fields are optional for PATCH)
  - `DELETE /api/v1/tujuan/{tujuan}`: Delete a specific recipient.

---

## Users
- **Controller:** `UserController`
- **Endpoints:**
  - `GET /api/v1/users`: List all users.
  - `POST /api/v1/users`: Create a new user.
    - **Request Body:**
      ```json
      {
        "nama": "Jane Doe", // required, string
        "username": "janedoe", // required, string, unique
        "email": "jane.doe@example.com", // required, email, unique
        "password": "password123", // required, string, min:8, confirmed
        "password_confirmation": "password123", // required, must match password
        "jabatan_id": 4, // required, integer
        "is_active": true // optional, boolean
      }
      ```
  - `GET /api/v1/users/{user}`: Show a specific user.
  - `PUT/PATCH /api/v1/users/{user}`: Update a specific user.
    - **Request Body:** (Same as POST, all fields are optional for PATCH)
  - `DELETE /api/v1/users/{user}`: Delete a specific user.
