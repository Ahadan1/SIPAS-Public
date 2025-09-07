# SIPAS-NG API Endpoints Quick Reference

This document provides a quick reference for all API endpoints in the SIPAS-NG system. For detailed documentation with request/response examples, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## Base URL
```
http://127.0.0.1:8000/api/v1
```

## Authentication
All endpoints require authentication via Laravel Sanctum unless otherwise noted.

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | User login |
| POST | `/logout` | User logout |
| GET | `/user` | Get authenticated user |

## Core Document Management

### Surat Masuk (Incoming Mail)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/surat-masuk` | List incoming mail |
| POST | `/surat-masuk` | Create incoming mail |
| GET | `/surat-masuk/{id}` | Get specific incoming mail |
| PUT | `/surat-masuk/{id}` | Update incoming mail |
| DELETE | `/surat-masuk/{id}` | Delete incoming mail |
| GET | `/surat-masuk/export` | Export to Excel |

### Surat Keluar (Outgoing Mail)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/surat-keluar` | List outgoing mail |
| POST | `/surat-keluar` | Create outgoing mail |
| GET | `/surat-keluar/{id}` | Get specific outgoing mail |
| PUT | `/surat-keluar/{id}` | Update outgoing mail |
| DELETE | `/surat-keluar/{id}` | Delete outgoing mail |
| GET | `/surat-keluar/export` | Export to Excel |

### Arsip (Archive)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/arsip` | Search across all documents |
| GET | `/arsip/export` | Export search results |

## Workflow Management

### Disposisi (Disposition)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/disposisi` | List dispositions |
| POST | `/disposisi` | Create disposition |
| GET | `/disposisi/{id}` | Get specific disposition |
| PUT | `/disposisi/{id}` | Update disposition |
| DELETE | `/disposisi/{id}` | Delete disposition |

### Lembar Pantau (Monitoring Sheets)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lembar-pantau` | List monitoring sheets |
| POST | `/lembar-pantau` | Create monitoring sheet |
| GET | `/lembar-pantau/{id}` | Get specific monitoring sheet |
| PUT | `/lembar-pantau/{id}` | Update monitoring sheet |
| DELETE | `/lembar-pantau/{id}` | Delete monitoring sheet |

## Activities & Meetings

### Kegiatan (Activities)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/kegiatan` | List activities |
| POST | `/kegiatan` | Create activity |
| GET | `/kegiatan/{id}` | Get specific activity |
| PUT | `/kegiatan/{id}` | Update activity |
| DELETE | `/kegiatan/{id}` | Delete activity |
| GET | `/kegiatan/export` | Export to Excel |

### Notulen (Meeting Minutes)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notulen` | List meeting minutes |
| POST | `/notulen` | Create meeting minutes |
| GET | `/notulen/{id}` | Get specific meeting minutes |
| PUT | `/notulen/{id}` | Update meeting minutes |
| DELETE | `/notulen/{id}` | Delete meeting minutes |
| GET | `/notulen/export` | Export to Excel |

## Reference Data Management

### Document Types
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jenis-naskah` | List document types |
| POST | `/jenis-naskah` | Create document type |
| PUT | `/jenis-naskah/{id}` | Update document type |
| DELETE | `/jenis-naskah/{id}` | Delete document type |

### Classifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/klasifikasi` | List classifications |
| POST | `/klasifikasi` | Create classification |
| PUT | `/klasifikasi/{id}` | Update classification |
| DELETE | `/klasifikasi/{id}` | Delete classification |

### Positions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jabatan` | List positions |
| POST | `/jabatan` | Create position |
| PUT | `/jabatan/{id}` | Update position |
| DELETE | `/jabatan/{id}` | Delete position |

## Reference Data (Ref Tables)

### Ref Document Types
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ref-jenis-naskah` | List reference document types |
| POST | `/ref-jenis-naskah` | Create reference document type |
| PUT | `/ref-jenis-naskah/{id}` | Update reference document type |
| DELETE | `/ref-jenis-naskah/{id}` | Delete reference document type |

### Ref Classifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ref-klasifikasi` | List reference classifications |
| POST | `/ref-klasifikasi` | Create reference classification |
| PUT | `/ref-klasifikasi/{id}` | Update reference classification |
| DELETE | `/ref-klasifikasi/{id}` | Delete reference classification |

### Ref Dispositions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ref-disposisi` | List reference dispositions |
| POST | `/ref-disposisi` | Create reference disposition |
| PUT | `/ref-disposisi/{id}` | Update reference disposition |
| DELETE | `/ref-disposisi/{id}` | Delete reference disposition |

### Ref Signatories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ref-penandatanganan` | List reference signatories |
| POST | `/ref-penandatanganan` | Create reference signatory |
| PUT | `/ref-penandatanganan/{id}` | Update reference signatory |
| DELETE | `/ref-penandatanganan/{id}` | Delete reference signatory |

### Ref Destinations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ref-tujuan` | List reference destinations |
| POST | `/ref-tujuan` | Create reference destination |
| PUT | `/ref-tujuan/{id}` | Update reference destination |
| DELETE | `/ref-tujuan/{id}` | Delete reference destination |

### Ref Positions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ref-jabatan` | List reference positions |
| POST | `/ref-jabatan` | Create reference position |
| PUT | `/ref-jabatan/{id}` | Update reference position |
| DELETE | `/ref-jabatan/{id}` | Delete reference position |

## User Management

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List users |
| POST | `/users` | Create user |
| GET | `/users/{id}` | Get specific user |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |

## Reports & Summaries

### Surat Rekap (Letter Summaries)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/surat-rekap` | List letter summaries |
| POST | `/surat-rekap` | Create letter summary |
| GET | `/surat-rekap/{id}` | Get specific letter summary |
| PUT | `/surat-rekap/{id}` | Update letter summary |
| DELETE | `/surat-rekap/{id}` | Delete letter summary |

### Carbon Copy & Recipients

#### Tembusan (Carbon Copy)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tembusan` | List carbon copies |
| POST | `/tembusan` | Create carbon copy |
| PUT | `/tembusan/{id}` | Update carbon copy |
| DELETE | `/tembusan/{id}` | Delete carbon copy |

#### Tujuan (Recipients)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tujuan` | List recipients |
| POST | `/tujuan` | Create recipient |
| PUT | `/tujuan/{id}` | Update recipient |
| DELETE | `/tujuan/{id}` | Delete recipient |

## File Management

### File Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload file |
| GET | `/files/{path}` | Download/view file |

## Common Query Parameters

Most GET endpoints support these query parameters:

- `page` - Page number for pagination
- `per_page` - Items per page (default: 10)
- `search` - Search term
- `sort` - Sort field
- `order` - Sort direction (asc/desc)
- `filter[field]` - Filter by field value

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "data": [...],
  "current_page": 1,
  "per_page": 10,
  "total": 100,
  "last_page": 10
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

## HTTP Status Codes

- `200` - OK (Success)
- `201` - Created
- `204` - No Content (Delete success)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity (Validation errors)
- `500` - Internal Server Error

## Authentication Headers

Include these headers in all authenticated requests:

```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

For file uploads, use:
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: multipart/form-data
```
