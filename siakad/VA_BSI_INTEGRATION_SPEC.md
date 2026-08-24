# 🏦 SPESIFIKASI INTEGRASI VIRTUAL ACCOUNT BANK SYARIAH INDONESIA (BSI)
## BANK SYARIAH INDONESIA (BSI) OPEN API HOST-TO-HOST BILLING ENGINE
### SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR

---

## 📌 1. Gambaran Umum Integrasi BSI
Sistem SIAKAD terhubung dengan core banking Bank Syariah Indonesia (BSI) melalui integrasi **Host-to-Host (H2H) Virtual Account Open API / Webhook**. Melalui integrasi ini:
1. Calon mahasiswa PMB langsung menerima nomor VA BSI begitu selesai mengisi formulir pendaftaran.
2. Mahasiswa aktif menerima nomor VA BSI untuk pembayaran UKT/SPP semesteran, her-registrasi, praktikum, sidang skripsi, dan wisuda.
3. Saat pembayaran dilakukan di channel BSI (BSI Mobile, ATM BSI, Teller, Agen BSI) maupun jaringan antar-bank (ATM Bersama, PRIMA, BI-FAST), BSI secara *real-time* mengirimkan Webhook Callback ke server SIAKAD untuk mengubah status tagihan menjadi **LUNAS**.

---

## 🔢 2. Struktur & Algoritma Nomor Virtual Account BSI

Nomor Virtual Account memiliki panjang **14–16 digit** dengan formulasi baku:

```
+------------------+-------------------+--------------------------------+
|  KODE INSTITUSI  | KODE JENIS TAGIHAN|     IDENTIFIKASI MAHASISWA     |
|     (4 Digit)    |     (2 Digit)     |          (8-10 Digit)          |
+------------------+-------------------+--------------------------------+
|       9928       |        01         |           260001               | -> PMB
|       9928       |        02         |          21010042              | -> UKT Mahasiswa
+------------------+-------------------+--------------------------------+
```

### Rincian Komponen:
1. **Kode Institusi Mitra BSI (4 Digit):** `9928` *(Kode Institusi STAI Al-Ittihad Cianjur)*.
2. **Kode Jenis Tagihan (2 Digit):**
   - `01`: Biaya Pendaftaran PMB
   - `02`: UKT / SPP Semesteran
   - `03`: Praktikum / Laboratorium
   - `04`: Biaya PPL / KKN
   - `05`: Ujian Komprehensif / Sidang Skripsi
   - `06`: Wisuda & Ijazah
3. **Nomor Identifikasi (8-10 Digit):**
   - Untuk PMB: Nomor Registrasi Calon Mahasiswa (e.g. `260001` -> `992801260001`)
   - Untuk Mahasiswa Aktif: NIM Mahasiswa (e.g. `21010042` -> `99280221010042`)

---

## 🔐 3. Keamanan & Verifikasi Signature (HMAC-SHA256)

Setiap request dari/ke BSI diamankan dengan Header Signature untuk mencegah manipulasi data di tengah jalan (*Man-in-the-Middle Attack*):

### Header Request BSI:
```http
Content-Type: application/json
X-BSI-Client-ID: stai_alittihad_bsi_client_2026
X-BSI-Timestamp: 2026-08-24T12:00:00+07:00
X-BSI-Signature: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

### Formula Perhitungan Signature:
```typescript
const stringToSign = `${clientId}|${timestamp}|${JSON.stringify(requestBody)}`;
const signature = crypto
  .createHmac('sha256', process.env.BSI_SECRET_KEY!)
  .update(stringToSign)
  .digest('hex');
```

---

## 📡 4. Endpoint Spesifikasi Host-to-Host (H2H)

### A. Endpoint 1: Inquiry Tagihan (`POST /api/v1/bsi/va/inquiry`)
Dipanggil oleh sistem BSI saat nasabah/mahasiswa memasukkan nomor VA di ATM BSI atau BSI Mobile.

#### Request Body (dari BSI):
```json
{
  "vaNumber": "99280221010042",
  "channel": "BSI_MOBILE",
  "transmissionDateTime": "2026-08-24T12:05:00+07:00",
  "bankReference": "BSI-INQ-981247182"
}
```

#### Response Body (dari SIAKAD):
```json
{
  "responseCode": "00",
  "responseMessage": "Success",
  "data": {
    "vaNumber": "99280221010042",
    "customerName": "Ahmad Fauzi Rahman",
    "studyProgram": "Pendidikan Agama Islam (S1)",
    "billType": "SPP / UKT Semester Ganjil 2026/2027",
    "amount": 2500000,
    "adminFee": 0,
    "totalAmount": 2500000,
    "invoiceNumber": "INV-202608-0042",
    "dueDate": "2026-09-10T23:59:59+07:00",
    "isPayable": true
  }
}
```

---

### B. Endpoint 2: Payment Callback Webhook (`POST /api/v1/bsi/va/payment`)
Dipanggil oleh sistem BSI setelah nasabah berhasil mendebet rekening/menyetor dana.

#### Request Body (dari BSI):
```json
{
  "vaNumber": "99280221010042",
  "invoiceNumber": "INV-202608-0042",
  "paidAmount": 2500000,
  "paymentDateTime": "2026-08-24T12:06:30+07:00",
  "bsiJournalNumber": "BSI-JRN-202608240019284",
  "channel": "BSI_MOBILE",
  "terminalId": "MBL-001"
}
```

#### Response Body (dari SIAKAD):
```json
{
  "responseCode": "00",
  "responseMessage": "Payment Acknowledged & Processed Successfully",
  "data": {
    "invoiceNumber": "INV-202608-0042",
    "status": "LUNAS",
    "clearedAt": "2026-08-24T12:06:31+07:00"
  }
}
```

#### Aksi Otomatis yang Dijalankan Server SIAKAD:
1. Memvalidasi kecocokan `paidAmount` dengan nominal tagihan.
2. Mengubah status `student_invoices` menjadi `LUNAS`.
3. Menyimpan `bsi_journal_number` ke dalam `va_bsi_transactions`.
4. **Trigger Otomatis:**
   - **Jika Tagihan PMB:** Mengubah status pendaftaran calon mahasiswa menjadi `TERVERIFIKASI_BAYAR` dan mengirim pesan WhatsApp/Email bukti bayar.
   - **Jika Tagihan UKT/SPP:** Membuka gembok *Financial Lock Guard*, mengizinkan mahasiswa mengisi KRS Online, dan mengirim notifikasi pelunasan.

---

## 🧪 5. Mock Sandbox Simulator (Untuk Uji Coba Tanpa API Bank)

Untuk mempermudah pengembangan lokal sebelum mendapatkan koneksi VPN resmi dari Bank BSI, sistem menyediakan halaman **Simulator VA BSI Sandbox**:
* **URL:** `/admin/sandbox/bsi-va`
* **Fitur:**
  - Pilih No VA dari daftar tagihan aktif.
  - Simulasi Channel Pembayaran (BSI Mobile, ATM BSI, Teller).
  - Tombol **"Trigger Pelunasan Sukses"** yang mengirimkan payload webhook ke server SIAKAD dan langsung menguji respons sistem secara end-to-end.
