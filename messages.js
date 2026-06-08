//https://github.com/bot-termux

module.exports = {
    msgUpdateSuccess: () => 
`✅ *PEMBARUAN BERHASIL*

Data Anda telah berhasil diperbarui dan tersimpan di sistem basis data Posyandu Teratai. 

Terima kasih atas kerja samanya.`,

    msgMainMenu: () => 
`🏥 *LAYANAN POSYANDU TERATAI*

Mohon maaf, format yang Anda masukkan belum sesuai. Silakan gunakan salah satu panduan pengisian data di bawah ini:

━━━━━━━━━━━━━━
👶 *DATA BALITA*
━━━━━━━━━━━━━━
Ketik pesan dengan susunan baris berikut:

BALITA
[NIK 16 Digit Balita]
[Nama Lengkap]
[Jenis Kelamin L/P]
[Tanggal Lahir DD-MM-YYYY]
[Alergi, isi "TIDAK ADA" jika tidak alergi]

_Contoh:_
BALITA
1671123456789012
AMA CANTIK
P
12-05-2024
TIDAK ADA

━━━━━━━━━━━━━━
🤰 *DATA BUMIL (IBU HAMIL)*
━━━━━━━━━━━━━━
BUMIL
[NIK 16 Digit]
[Nama Lengkap]
[Usia Kandungan dalam bulan]
[Alergi, isi "TIDAK ADA" jika tidak alergi]

━━━━━━━━━━━━━━
🤱 *DATA BUSUI (IBU MENYUSUI)*
━━━━━━━━━━━━━━
BUSUI
[NIK 16 Digit]
[Nama Lengkap]
[Usia Balita dalam bulan]
[Alergi, isi "TIDAK ADA" jika tidak alergi]

━━━━━━━━━━━━━━
💡 *PANDUAN LAINNYA*
━━━━━━━━━━━━━━
🔍 *Cek Data:*
Ketik baris pertama CEK, baris kedua NIK Anda.

✏️ *Ubah Data:*
Kirim ulang format data baru dengan NIK yang sama. Sistem akan otomatis menanyakan konfirmasi pembaruan.`,

    msgCheckFound: (sheet, data, statusMBG) => {
        const usiaLabel = sheet === 'Bumil' ? 'bulan (Kandungan)' : 'bulan';
        const alergi = sheet === 'Balita' ? data[5] : data[4];
        return `🔍 *HASIL PENCARIAN DATA*

Data ditemukan pada kategori *${sheet}*:

🆔 NIK : ${data[1]}
👤 Nama : ${data[2]}
📅 Usia : ${data[3]} ${usiaLabel}
🤧 Alergi : ${alergi || "-"}${statusMBG}

Data ini telah terdaftar di sistem Posyandu Teratai.`;
    },

    msgCheckNotFound: (nik) => 
`❌ *DATA TIDAK DITEMUKAN*

Maaf, NIK *${nik}* tidak terdaftar di sistem kami.`,

    msgConfirmUpdate: (kategori, oldData, newData) => {
        let oldDetail = "";
        let newDetail = "";

        if (kategori === "Balita") {
            oldDetail = `📅 Umur : ${oldData[3]} bulan\n🚻 Kelamin : ${oldData[4]}`;
            newDetail = `📅 Umur : ${newData.umur} bulan (Input Tgl Lahir)\n🚻 Kelamin : ${newData.jk}`;
        } else if (kategori === "Bumil") {
            oldDetail = `📅 Usia Kandungan : ${oldData[3]} bulan\n🤧 Alergi : ${oldData[4] || "-"}`;
            newDetail = `📅 Usia Kandungan : ${newData.umur} bulan\n🤧 Alergi : ${newData.alergi}`;
        } else if (kategori === "Busui") {
            oldDetail = `📅 Usia Balita : ${oldData[3]} bulan\n🤧 Alergi : ${oldData[4] || "-"}`;
            newDetail = `📅 Usia Balita : ${newData.umur} bulan\n🤧 Alergi : ${newData.alergi}`;
        }

        return `⚠️ *PEMBERITAHUAN: NIK TELAH TERDAFTAR*

Sistem mendeteksi NIK sudah terdaftar pada kategori ${kategori}.

📌 *DATA LAMA:*
👤 Nama : ${oldData[2]}
${oldDetail}

📌 *DATA BARU:*
👤 Nama : ${newData.nama}
${newDetail}

━━━━━━━━━━━━━━
Apakah Anda yakin ingin menimpa data lama dengan data baru di atas?

Silakan balas dengan mengetik kata:
*YAKIN*
(untuk melanjutkan pembaruan data).`;
    },

    msgRegSuccess: (nik, nama, type, mbgNotif) => 
`✅ *REGISTRASI BERHASIL*

Data berikut telah tersimpan ke dalam sistem:

🆔 NIK : ${nik}
👤 Nama : ${nama}
📂 Kategori : ${type}${mbgNotif}

Terima kasih atas partisipasi Anda.`,

    msgError: () => 
`❌ *MOHON MAAF*

Terjadi kendala teknis saat memproses atau menyimpan data Anda ke sistem kami. 

Mohon periksa kembali jaringan/format Anda atau coba beberapa saat lagi.`
};
