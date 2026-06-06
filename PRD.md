# PRD — DOCX Version Control (POC)

## Overview

Aplikasi web untuk melacak perubahan dokumen `.docx` secara otomatis. User upload file, sistem menyimpan setiap versi dan menampilkan diff antar versi secara visual. Target awal: mahasiswa yang ingin tracking revisi skripsi mandiri.

---

## Problem Statement

Saat ini tidak ada tool yang secara spesifik menangani version control untuk dokumen Word dengan cara yang mudah dipakai oleh non-developer. Solusi yang ada:

- **Rename manual** (`skripsi_final_v3_REVISED.docx`) — tidak terstruktur, rawan hilang
- **Google Docs** — version history ada tapi diff-nya tidak bermakna per paragraf, dan tidak support file `.docx` native
- **Git** — terlalu teknis, tidak bisa diff binary/DOCX secara readable

---

## Goals (POC)

1. User bisa upload file `.docx` dan sistem menyimpannya sebagai versi baru secara otomatis
2. User bisa melihat daftar semua versi dari satu dokumen
3. User bisa memilih dua versi dan melihat diff per paragraf secara visual

---

## Non-Goals (POC)

- Collaborative editing / multi-user per dokumen
- Comment atau annotation pada diff
- Support format selain `.docx`
- Authentication (single user, no login untuk POC)
- Mobile responsiveness

---

## Core Concepts

### Dual Storage
Setiap versi menyimpan dua representasi:
- **File DOCX asli** — disimpan di object storage (Supabase Storage), untuk keperluan download
- **Extracted text per paragraf** — disimpan di database, untuk keperluan diff

### Auto-versioning
Setiap kali user upload file `.docx` untuk dokumen yang sama, sistem otomatis mencatat sebagai versi baru. Tidak ada tombol "save as version" — upload = versi baru.

### On-demand Diff
Diff tidak dihitung saat upload. Diff dihitung saat user memilih dua versi untuk dibandingkan. Unit diff adalah **paragraf** sebagai anchor utama, dengan highlight kata-level di dalam paragraf yang berubah.

---

## Data Model

### Tabel `documents`
```
id            uuid, primary key
title         text
owner_id      text              -- placeholder, untuk ekspansi collaborative
created_at    timestamp
updated_at    timestamp
```

### Tabel `versions`
```
id              uuid, primary key
document_id     uuid, foreign key → documents.id
version_number  integer           -- increment per dokumen, mulai dari 1
author_id       text              -- placeholder, untuk ekspansi collaborative
extracted_text  text[]            -- array of paragraphs
storage_url     text              -- path ke file DOCX di Supabase Storage
created_at      timestamp
updated_at      timestamp
```

> `extracted_text` disimpan sebagai array of strings, dimana setiap element adalah satu paragraf. Ini memudahkan diff langsung per paragraf tanpa perlu re-split saat query.

---

## User Flow

```
1. User membuka aplikasi
2. User membuat dokumen baru (input: judul)
3. User upload file .docx → sistem extract paragraf → simpan versi 1
4. User upload file .docx yang sudah direvisi → sistem simpan versi 2
5. User membuka halaman versi → melihat daftar semua versi + timestamp
6. User memilih dua versi → melihat diff visual per paragraf
```

---

## Diff Mechanism

- **Library:** `jsdiff`
- **Unit utama:** paragraf (diambil dari `extracted_text` array)
- **Unit sekunder:** kata-level highlight di dalam paragraf yang berubah
- **Tampilan:** inline diff — paragraf ditambah (hijau), dihapus (merah), berubah (kuning dengan highlight kata)
- **Timing:** on-demand saat user request comparison

---

## Stack

| Layer | Pilihan |
|---|---|
| Frontend | React + Vite + TypeScript |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| DOCX Extraction | `mammoth` (JS) |
| Diff | `jsdiff` |

---

## Supabase Storage Structure

```
bucket: docx-versions/
└── {document_id}/
    └── v{version_number}_{timestamp}.docx
```

---

## Out of Scope — Candidates untuk Iterasi Berikutnya

- Login & authentication
- Collaborative review (multi-author per dokumen)
- Label / nama versi manual ("Setelah bimbingan pertama")
- Export diff sebagai PDF/report
- Notifikasi
- Delta storage (optimasi storage jika versi sangat banyak)
- Estimasi halaman di UI