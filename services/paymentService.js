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
    undefined: 'undefined',
    denied: 'denied'
}
const adapter = new FileSync('db/db.json')

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
        paymentId: payment.paymentId,
        status: newStatus || payment.status,
        date: moment().toJSON()
    };
}

function getStatus(payment) {
    if(payment.installments >= 1 && payment.installments <= 5)
        return statuses.approved;
    else if(payment.installments >= 6 && payment.installments <= 10) 
        return statuses.undefined;    
    return statuses.denied;
    
}

function create(data) {
    var payment = new Payment(data);

    var existingPayment = find(payment.paymentId);

    if(existingPayment) return new Promise((resolve, reject) => { resolve(existingPayment); });

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

function find(paymentId) {
    var payment =  getPaymentsDB()
        .cloneDeep()
        .find({ paymentId: paymentId})
        .value();
    if(payment)
        payment.transactions = 
            getTransactionsDB()
            .filter({ paymentId: paymentId})
            .orderBy('date', 'desc')
            .take(1)
            .value()

    return payment;
}

function transactions(paymentId) {
    return getTransactionsDB()
        .find({ paymentId: paymentId})
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
        .find({paymentId: payment.paymentId})
        .assign({ status: newStatus})
        .write()
        .then((p) => {
            return find(payment.paymentId);
        })
    })
}

function changePaymentStatus(paymentId, newStatus) {
    return new Promise((resolve, reject) => {
        var payment = find(paymentId);
        if(payment) {
            if(payment.transactions 
                && payment.transactions[0].status 
                && payment.transactions[0].status !== statuses.undefined) {
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

function approve(paymentId) {
    return changePaymentStatus(paymentId, statuses.approved)
}

function deny(paymentId) {
    return changePaymentStatus(paymentId, statuses.denied)
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

