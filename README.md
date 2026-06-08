# 🤖 Bot WhatsApp Registrasi Posyandu untuk Program MBG

Bot WhatsApp terintegrasi langsung dengan **Google Sheets** menggunakan pustaka Baileys (WhatsApp Web API) dan Google Sheets API. Bot ini dirancang untuk memudahkan pencatatan, pembaruan, dan pengecekan data Balita, Ibu Hamil (Bumil), dan Ibu Menyusui (Busui) secara otomatis via WhatsApp.

---

## 🌟 Fitur Utama

* **Pencatatan Multikategori:** Mendukung registrasi data Balita, Bumil, dan Busui ke dalam *sheet* (lembar kerja) yang terpisah.
* **Pengecekan NIK Otomatis:** Fitur `CEK` untuk melihat apakah NIK sudah terdaftar beserta detail data terkininya.
* **Deteksi Kelayakan MBG (Makanan Bergizi Gratis):** Secara dinamis mengecek apakah Balita layak mendapatkan MBG dengan rentang usia wajib **20 hingga 60 bulan**.
* **Suntik Rumus Dinamis ke Sheets:** Bot tidak menyimpan usia balita secara statis, melainkan menyisipkan rumus `DATEDIF` dan `INDIRECT` langsung ke Google Sheets. Usia balita akan terus *update* setiap hari secara otomatis.

---

## 🛠️ Persiapan Awal (Prerequisites)

1. **Node.js** (Minimal versi v16 atau terbaru).
2. Nomor WhatsApp aktif khusus untuk Bot.
3. Akun Google untuk mengakses Google Cloud Console dan Google Sheets.

---

## 🔑 Cara Mendapatkan `credentials.json` (Google Sheets API)

Untuk mengizinkan bot membaca dan menulis ke Google Sheets kamu, ikuti langkah-langkah pembuatan Service Account berikut:

### Langkah 1: Buat Project di Google Cloud
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Login menggunakan akun Google kamu.
3. Klik *dropdown* Project di menu atas, lalu klik **New Project**.
4. Beri nama project (misal: `Bot Posyandu`), lalu klik **Create**.

### Langkah 2: Aktifkan API
1. Di menu navigasi kiri, pilih **APIs & Services** > **Library**.
2. Cari **Google Sheets API**, lalu klik **Enable**.
3. Kembali ke Library, cari **Google Drive API**, lalu klik **Enable**.

### Langkah 3: Buat Service Account & Unduh JSON
1. Di menu kiri, pilih **APIs & Services** > **Credentials**.
2. Klik tombol **+ CREATE CREDENTIALS** di atas, pilih **Service account**.
3. Isi nama service account (misal: `bot-sheet-access`), klik **Create and Continue**, lalu klik **Done**.
4. Di daftar Service Accounts yang baru saja terbuat, klik ikon pensil (Edit) atau klik alamat email-nya.
5. Pindah ke tab **KEYS**, klik **Add Key** > **Create new key**.
6. Pilih format **JSON**, lalu klik **Create**.
7. File akan otomatis terunduh. Ubah nama file tersebut menjadi `credentials.json` dan letakkan di dalam folder project bot kamu (satu folder dengan `index.js`).

### Langkah 4: Bagikan Akses Google Sheets
1. Buka file `credentials.json` kamu, cari baris `"client_email"`. *Copy* alamat email tersebut (berakhiran `@...iam.gserviceaccount.com`).
2. Buka file **Google Sheets** Posyandu milikmu. contoh format : https://docs.google.com/spreadsheets/d/11nrPSdmXHT8-KA4Y5sBrOMSsWShKc0dUZIEY6540uEo/edit?usp=sharing
3. Klik tombol **Share** (Bagikan) di pojok kanan atas.
4. *Paste* alamat email *Service Account* tadi, dan berikan akses sebagai **Editor**.
5. Salin ID Spreadsheet dari URL-nya (Bagian acak di antara `/d/` dan `/edit`). Masukkan ID ini ke dalam konfigurasi kode bot kamu (di file `sheet.js`).

---

## 🚀 Cara Menjalankan Bot

1. git clone git@github.com:bot-termux/posyandu-mbg-whastapps-spreadsheet.git
2. cd posyandu-mbg-whastapps-spreadsheet.git
3. Install semua *dependencies* (pustaka Baileys, Google API, QRCode, dll) dengan menjalankan perintah:
   ```bash
npm install
```
4. Jalankan bot menggunakan perintah:
   ```bash
node index.js
```
5. Scan QR Code yang muncul di layar terminal menggunakan aplikasi WhatsApp di HP yang akan dijadikan Bot (Buka WA > Perangkat Tertaut > Tautkan Perangkat).
6. Jika muncul keterangan `✅ Bot WhatsApp Terhubung`, berarti bot sudah siap digunakan!

---

## 📱 Format Pesan Penggunaan Bot

Kirim pesan ke nomor bot menggunakan susunan baris berikut (tanpa tanda kurung siku `[]`):

### 1. Registrasi / Pembaruan Data Balita
```text
BALITA
[NIK 16 Digit Balita]
[Nama Lengkap]
[Jenis Kelamin L/P]
[Tanggal Lahir DD-MM-YYYY]
[Alergi, isi "TIDAK ADA" jika tidak alergi]
```
*Contoh:*
```text
BALITA
1671123456789012
AMA CANTIK
P
12-05-2024
TIDAK ADA
```

### 2. Registrasi / Pembaruan Data Bumil (Ibu Hamil)
```text
BUMIL
[NIK 16 Digit]
[Nama Lengkap]
[Usia Kandungan dalam bulan]
[Alergi, isi "TIDAK ADA" jika tidak alergi]
```

### 3. Registrasi / Pembaruan Data Busui (Ibu Menyusui)
```text
BUSUI
[NIK 16 Digit]
[Nama Lengkap]
[Usia Balita dalam bulan]
[Alergi, isi "TIDAK ADA" jika tidak alergi]
```

### 4. Cek Data Terdaftar
Untuk mengecek apakah NIK sudah terdaftar dan masuk kriteria MBG atau belum:
```text
CEK
[NIK 16 Digit]
```

---

## 🔄 Sistem Konfirmasi Pembaruan Data

Jika *user* mengirimkan format pendaftaran, namun sistem mendeteksi bahwa **NIK tersebut sudah pernah terdaftar**, bot tidak akan langsung menimpa data lama. 

1. Bot akan membalas dengan menampilkan **Perbandingan Data Lama vs Data Baru**.
2. Bot akan meminta konfirmasi kepada *user*.
3. Jika *user* setuju untuk menimpa data lama dengan data baru, *user* harus membalas dengan mengetik kata:
   `YAKIN`
4. Sistem akan otomatis memperbarui data di baris yang sesuai pada Google Sheets.
