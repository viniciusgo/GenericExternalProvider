const fs = require('fs');
const path = require('path');

function ErrorReason(message, httpCode) {
    this.message = message;
    this.httpCode = httpCode
}

var pixData = {
};

function generatePixData(host) {
    if(!pixData.PixQRCodeBase64)
    {
        console.log(__dirname);
        pixData.PixQRCodeBase64 = fs.readFileSync(__dirname + '\\..\\static\\pixQRCode.png', { encoding: 'base64'});
        pixData.PixQRCodeURL = host + '/pixQRCode.png';
        pixData.PixKey =  '00020101021226910014br.gov.bcb.pix2569qrcodes-h.cielo.com.br/pix-qr/v2/42a9a7b4-6346-4072-a11b-406d27352d2152040000530398654041.005802BR5918Merchant Teste HML6009Sao Paulo62070503***63040B76';
    }

    return pixData;
}

module.exports = {
    ErrorReason: ErrorReason,
    generatePixData: generatePixData
}