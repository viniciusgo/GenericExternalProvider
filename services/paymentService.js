var mongoose = require('mongoose')
var moment = require('moment')
var Payment = require('../models/payment')
//var Payment = mongoose.model('payment');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileAsync')
let db = undefined;

const adapter = new FileSync('db/db.json')
function init() {
    low(adapter)
    .then(dbi => {
        db = dbi;
        return db.defaults({ payments: [], transactions: [] }).write();
    })
}

var statuses = {
    approved: 'approved',
    undefined: 'undefined',
    denied: 'denied'
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

    var p = find(payment.paymentId);

    if(p) return new Promise((resolve, reject) => { resolve(p); });

    return payment.validate().then(() => {
        return db.get('payments')
        .push(data)
        .last()
        .write()
        .then((p) => {
            p.status = getStatus(p);
            return db.get('transactions')
            .push({
                paymentId: p.paymentId,
                status: p.status,
                date: moment().toJSON()
            })
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
    var payment =  db.get('payments')
        .find({ paymentId: paymentId})
        .value();
    if(payment)
        payment.transactions = 
            db.get('transactions')
            .filter({ paymentId: paymentId})
            .orderBy('date', 'desc')
            .take(1)
            .value()

    return payment;
}

function transactions(paymentId) {
    return db.get('transactions')
        .find({ paymentId: paymentId})
        .value();
}

function list() {
    return db.get('payments')
        .value();
}

module.exports = {
    create: create,
    find: find,
    transactions: transactions,
    list: list,
    init: init
}

