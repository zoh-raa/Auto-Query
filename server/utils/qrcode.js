const QRCode = require('qrcode');

async function generateQRCode(text) {
    try {
        return await QRCode.toDataURL(text);
    } catch (err) {
        console.error("QR Code generation error:", err);
        throw err;
    }
}

module.exports = { generateQRCode };
