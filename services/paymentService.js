const mongoose = require('mongoose')
const moment = require('moment')
const fetch = require('node-fetch');
const Payment = require('../models/payment')
const utils = require('./utils')
//var Payment = mongoose.model('payment');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileAsync')


const statuses = {
    approved: 'approved',
    pendding: 'pending',
    undefined: 'undefined',
    denied: 'denied'
}
const adapter = new FileSync('./db/db.json')

let db = undefined;
function init() {
    low(adapter)
    .then(dbi => {
        db = dbi;
        return db.defaults({ payments: [], transactions: [] }).write();
    })
    .catch(console.log)
}

function callCallBack(url, data) {
    return fetch(url, {
        method: 'post',
        body:    JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
    });
}

function getPaymentsDB() {
    return db.get('payments');
}

function getTransactionsDB() {
    return db.get('transactions');
}

function newTransactionData(payment, newStatus) {
    return {
        TId: payment.TId,
        status: newStatus || payment.status,
        date: moment().toJSON()
    };
}

function getStatus(payment) {
    if(payment.Installments >= 1 && payment.Installments <= 5)
        return statuses.pendding;
    else if(payment.Installments >= 6 && payment.Installments <= 10) 
        return statuses.approved;    
    return statuses.denied;
    
}

function create(data, host) {
    var payment = new Payment(data);

    var existingPayment = find(payment.TId);

    if(existingPayment) return new Promise((resolve, reject) => { resolve(existingPayment); });

    data.TId = data.TransactionId;
    //if(data.PaymentMethod == 'PIX')
    {
        var pixData = utils.generatePixData(host);
        data.PixKey = pixData.PixKey;
        data.PixQRCodeURL = pixData.PixQRCodeURL;
        data.PixQRCodeBase64 = pixData.PixQRCodeBase64;

        var now = new Date();
        now.setSeconds(now.getSeconds() + (data.ExpiresIn || 24*60*60));
        data.ExpiresAt = now;
    }

    return payment.validate().then(() => {
        return getPaymentsDB()
        .push(data)
        .cloneDeep()
        .last()
        .write()
        .then((p) => {
            p.status = getStatus(p);
            return getTransactionsDB()
                    .push(newTransactionData(p))
                    .last()
                    .write()
                    .then((transaction) => {
                        p.transactions = [transaction];
                        return p;
                    })
        })
    });
}

function find(TId) {
    var payment =  getPaymentsDB()
        .cloneDeep()
        .find({ TId: TId})
        .value();
    if(payment)
        payment.transactions = 
            getTransactionsDB()
            .filter({ TId: TId})
            .orderBy('date', 'desc')
            .take(1)
            .value()

    return payment;
}

function transactions(TId) {
    return getTransactionsDB()
        .find({ TId: TId})
        .value();
}

function list() {
    return getPaymentsDB().value();
}

function updatePaymentStatus(payment, newStatus) {
    return getTransactionsDB()
    .push(newTransactionData(payment, newStatus))
    .last()
    .write()
    .then((t) => {
        return getPaymentsDB()
        .find({TId: payment.TId})
        .assign({ status: newStatus})
        .write()
        .then((p) => {
            return find(payment.TId);
        })
    })
}

function changePaymentStatus(TId, newStatus) {
    return new Promise((resolve, reject) => {
        var payment = find(TId);
        if(payment) {
            if(payment.transactions 
                && payment.transactions[0].status 
                && payment.transactions[0].status === newStatus) {
                reject(new utils.ErrorReason(`Payment already ${payment.transactions[0].status}`, 400))
            } else {
                updatePaymentStatus(payment, newStatus)
                .then((p) => {
                    if(p.callbackUrl) callCallBack(p.callbackUrl, p);
                    resolve(p)
                })
                .catch((reason) => reject(reason));
            }
        }
        else reject(new utils.ErrorReason(`Cant find payment to be ${newStatus}}`, 404))
    });
}

function approve(TId) {
    return changePaymentStatus(TId, statuses.approved)
}

function deny(TId) {
    return changePaymentStatus(TId, statuses.denied)
}

function state() {
    return db.getState();
}

module.exports = {
    create: create,
    find: find,
    transactions: transactions,
    list: list,
    init: init,

    //satatus
    state: state,
    //callbacks
    approve: approve,
    deny: deny
}

