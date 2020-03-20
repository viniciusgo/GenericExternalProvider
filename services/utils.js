function ErrorReason(message, httpCode) {
    this.message = message;
    this.httpCode = httpCode
}

module.exports = {
    ErrorReason: ErrorReason
}