var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var paymentSchema = new Schema({
    reference: {
        type: String,
        required: 'reference is rqeuired'
    },
    paymentId: {
        type: String,
        required: 'paymentID is required'
    },
    value: {
        type: Number,
        required: 'value is required'
    },
    currency: {
        type: String
    },
    installments: {
        type: Number,
        default: 1,
    },
    callbackUrl: {
        type: String
    },
    returnUrl: {
        type: String
    },
    status: {
        type: String,
        default: 'undefined'
    }
})

module.exports = mongoose.model('payment', paymentSchema);