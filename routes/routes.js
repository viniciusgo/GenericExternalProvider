
var express = require('express');
var router = express.Router();

var transactionService = require('../services/paymentService')

transactionService.init();

router.all('/', function(req, res){
    transactionService.create(req.body).then(document => {
        res.json(document)
    }).catch(reason => { 
        res.json(reason) 
    })
})

router.get('/list', function(req, res){
    res.json(transactionService.list());    
})

router.get('/:paymentId', function(req, res){
    res.json(transactionService.find(req.params.paymentId));    
})

router.get('/:paymentId/transactions', (req, res) => {
    res.json(transactionService.transactions(req.params.paymentId));
})

router.get('/:paymentId/cancellations', (re, res) => {

})

module.exports = router;
