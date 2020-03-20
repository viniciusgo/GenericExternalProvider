
var express = require('express');
var router = express.Router();

var paymentService = require('../services/paymentService')

paymentService.init();

router.all('/', function(req, res){
    paymentService.create(req.body).then(document => {
        res.json(document)
    }).catch(reason => { 
        res.json(reason) 
    })
})

router.get('/list', function(req, res){
    res.json(paymentService.list());    
})

router.get('/state', (req, res) => {
    res.json(paymentService.state());
})

router.get('/:paymentId', function(req, res){
    res.json(paymentService.find(req.params.paymentId));    
})

router.get('/:paymentId/transactions', (req, res) => {
    res.json(paymentService.transactions(req.params.paymentId));
})

router.get('/:paymentId/approve', (req, res) => {
    paymentService.approve(req.params.paymentId).then((payment) => {
        res.json(payment);
    })
    .catch((reason) => {
        res.status(reason.httpCode).send(reason.message)
    })
    
})

router.get('/:paymentId/deny', (req, res) => {
    paymentService.deny(req.params.paymentId).then((payment) => {
        res.json(payment);
    })
    .catch((reason) => {
        res.status(reason.httpCode).send(reason.message)
    })
})

module.exports = router;
