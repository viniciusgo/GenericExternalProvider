var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var paymentSchema = new Schema({
    PaymentMethod: {
        type: String
    },
    TId: {
        type: String
    },
    MerchantOrderId: {
        type: String
    },
    TransactionId: {
        type: String
    },
    OrderNumber: {
        type: String
    },
    Currency: {
        type: String
    },
    Installments: {
        type: Number
    },
    TotalAmount: {
        type: Number
    },
    TotalDiscountAmount: {
        type: Number
    },
    TotalShippingAmount: {
        type: Number
    },
    Customer: {
        Name: {
        type: String
        },
        DocumentNumber: {
        type: String
        },
        DocumentType: {
        type: String
        },
        Phone: {
        type: String
        },
        CellPhone: {
        type: String
        },
        Email: {
        type: String
        },
        BillingAddress: {
        Street: {
            type: String
        },
        Number: {
            type: Date
        },
        Complement: {
            type: Date
        },
        ZipCode: {
            type: String
        },
        City: {
            type: String
        },
        Country: {
            type: String
        },
        State: {
            type: String
        },
        District: {
            type: String
        }
        },
        ShippingAddress: {
            Street: {
                type: String
            },
            Number: {
                type: Date
            },
            Complement: {
                type: Date
            },
            ZipCode: {
                type: String
            },
            City: {
                type: String
            },
            Country: {
                type: String
            },
            State: {
                type: String
            },
            District: {
                type: String
            }
        }
    },
    Items: {
        type: [
            'Mixed'
        ]
    },
    CallbackUrl: {
        type: String
    },
    ClientId: {
        type: String
    },
    Status: {
        type: String,
        default: undefined
    },
    PixKey: {
        type: String
    },
    PixQRCodeURL: {
        type: String
    },
    PixQRCodeBase64: {
        type: String
    }
})

module.exports = mongoose.model('payment', paymentSchema);