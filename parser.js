//https://github.com/bot-termux

const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(customParseFormat);

function umurBulan(tglLahir) {
    return dayjs().diff(
        dayjs(tglLahir, "DD-MM-YYYY"),
        "month"
    );
}

function parseMessage(text) {
    const data = text
        .split("\n")
        .map(v => v.trim())
        .filter(v => v);

    if (!data.length) return null;

    const type = data[0].toUpperCase();

    // 1. FORMAT BALITA
    if (type === "BALITA") {
        if (data.length < 5) return null;

        return {
            type: "BALITA",
            nik: data[1],
            nama: data[2],
            jk: data[3].toUpperCase().startsWith("P") ? "P" : "L",
            tglLahir: data[4],
            alergi: data[5] || "TIDAK ADA",
            umur: umurBulan(data[4])
        };
    }

    // 2. FORMAT BUMIL
    if (type === "BUMIL") {
        if (data.length < 4) return null;

        return {
            type: "BUMIL",
            nik: data[1],
            nama: data[2],
            umur: data[3],
            alergi: data[4] || "TIDAK ADA"
        };
    }

    // 3. FORMAT BUSUI
    if (type === "BUSUI") {
        if (data.length < 4) return null;

        return {
            type: "BUSUI",
            nik: data[1],
            nama: data[2],
            umur: data[3],
            alergi: data[4] || "TIDAK ADA"
        };
    }

    // 4. FORMAT CEK DATA
    if (type === "CEK") {
        if (data.length < 2) return null;

        return {
            type: "CEK",
            nik: data[1] 
        };
    }

    return null;
}

module.exports = {
    parseMessage
};
