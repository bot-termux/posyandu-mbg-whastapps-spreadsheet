//https://github.com/bot-termux

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const QRCode = require("qrcode-terminal");

const {
    appendRow,
    findNik,
    findNikAll,
    updateRow
} = require("./sheet");

const { parseMessage } = require("./parser");

const { 
    msgUpdateSuccess, 
    msgMainMenu, 
    msgCheckFound, 
    msgCheckNotFound, 
    msgConfirmUpdate, 
    msgRegSuccess, 
    msgError 
} = require("./messages");

const pendingUpdate = new Map();

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        syncFullHistory: false,
        markOnlineOnConnect: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("\nSCAN QR INI:\n");
            QRCode.generate(qr, { small: true });
        }

        if (connection === "connecting") console.log("Menghubungkan...");
        if (connection === "open") console.log("✅ Bot WhatsApp Terhubung");

        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Koneksi terputus", shouldReconnect ? "Reconnect..." : "Logged Out");
            if (shouldReconnect) startBot();
        }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        try {
            const msg = messages[0];
            if (!msg || msg.key.fromMe || !msg.message) return;

            let text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
            if (!text) return;
            
            const sender = msg.key.remoteJid;
            const pending = pendingUpdate.get(sender);

            // 1. RESPON KONFIRMASI UPDATE DATA
            if (text.trim().toUpperCase() === "YAKIN" && pending) {
                await updateRow(pending.sheet, pending.rowNumber, pending.values);
                pendingUpdate.delete(sender);
                await sock.sendMessage(sender, { text: msgUpdateSuccess() });
                return;
            }

            const result = parseMessage(text);

            // 2. RESPON JIKA FORMAT SALAH / MENU UTAMA
            if (!result) {
                await sock.sendMessage(sender, { text: msgMainMenu() });
                return;
            }

            // CEK NIK
            if (result.type === "CEK") {
                const existing = await findNikAll(result.nik);

                if (existing) {
                    let statusMBG = "";
                    if (existing.sheet === "Balita") {
                        const umurRealtime = parseInt(existing.data[3]) || 0;
                        if (umurRealtime < 20 || umurRealtime > 60) {
                            statusMBG = `\n\n⚠️ *KETERANGAN:*\nUsia balita saat ini ${umurRealtime} bulan (di luar rentang 20-60 bulan), sehingga *TIDAK TERMASUK* penerima manfaat MBG.`;
                        } else {
                            statusMBG = "\n\n✅ *KETERANGAN:*\nUsia balita memenuhi kriteria (20-60 bulan) sebagai penerima manfaat MBG.";
                        }
                    }
                    await sock.sendMessage(sender, { text: msgCheckFound(existing.sheet, existing.data, statusMBG) });
                } else {
                    await sock.sendMessage(sender, { text: msgCheckNotFound(result.nik) });
                }
                return; 
            }


            // PROSES INPUT DATA BARU / UPDATE
            let sheetName = "";
            let values = [];

            if (result.type === "BALITA") {
                sheetName = "Balita";
                const existing = await findNik(sheetName, result.nik);
                values = [
                    existing?.data?.[0] || `=IF(AND(INDIRECT("C"&ROW())<>"");COUNTIFS($C$3:INDIRECT("C"&ROW());"<>");"")`,
                    result.nik,
                    result.nama,
                    `=DATEDIF(INDIRECT("G"&ROW()); TODAY(); "M")`, 
                    result.jk,
                    result.alergi,
                    result.tglLahir
                ];
                if (existing) {
                    pendingUpdate.set(sender, { sheet: sheetName, rowNumber: existing.rowNumber, values, createdAt: Date.now() });
                    await sock.sendMessage(sender, { text: msgConfirmUpdate("Balita", existing.data, result) });
                    return;
                }
            } 
            else if (result.type === "BUMIL") {
                sheetName = "Bumil";
                const existing = await findNik(sheetName, result.nik);
                values = [
                    existing?.data?.[0] || `=IF(AND(INDIRECT("C"&ROW())<>"");COUNTIFS($C$3:INDIRECT("C"&ROW());"<>");"")`,
                    result.nik,
                    result.nama,
                    result.umur,
                    result.alergi
                ];
                if (existing) {
                    pendingUpdate.set(sender, { sheet: sheetName, rowNumber: existing.rowNumber, values, createdAt: Date.now() });
                    await sock.sendMessage(sender, { text: msgConfirmUpdate("Bumil", existing.data, result) });
                    return;
                }
            } 
            else if (result.type === "BUSUI") {
                sheetName = "Busui";
                const existing = await findNik(sheetName, result.nik);
                values = [
                    existing?.data?.[0] || `=IF(AND(INDIRECT("C"&ROW())<>"");COUNTIFS($C$3:INDIRECT("C"&ROW());"<>");"")`,
                    result.nik,
                    result.nama,
                    result.umur,
                    result.alergi
                ];
                if (existing) {
                    pendingUpdate.set(sender, { sheet: sheetName, rowNumber: existing.rowNumber, values, createdAt: Date.now() });
                    await sock.sendMessage(sender, { text: msgConfirmUpdate("Busui", existing.data, result) });
                    return;
                }
            }

            await appendRow(sheetName, values);


            // PESAN SUKSES TAMBAH DATA

            let mbgNotif = "";
            if (result.type === "BALITA") {
                if (result.umur < 20 || result.umur > 60) {
                    mbgNotif = `\n\n⚠️ *CATATAN:*\nKarena usia balita terdeteksi ${result.umur} bulan (di luar rentang 20-60 bulan), maka *TIDAK TERMASUK* penerima manfaat MBG.`;
                } else {
                    mbgNotif = "\n\n✅ *CATATAN:*\nBalita memenuhi kriteria dan terdaftar sebagai penerima manfaat MBG.";
                }
            }

            await sock.sendMessage(sender, { 
                text: msgRegSuccess(result.nik, result.nama, result.type, mbgNotif) 
            });

        } catch (err) {
            console.error("ERROR:", err);
            try {
                await sock.sendMessage(messages[0].key.remoteJid, { text: msgError() });
            } catch {}
        }
    });
}

startBot();
