
var express = require('express');
var router = express.Router();

var paymentService = require('../services/paymentService')

paymentService.init();

/**
 * @typedef Payment
 * @property {string} reference.required
 * @property {string} paymentId.required
 * @property {number} value.required
 * @property {string} currency
 * @property {integer} installments
 * @property {string} callbackUrl
 * @property {string} returnUrl
*/

/**
 * Cria um novo pagamento
 * @route POST /
 * @group payments - Operations about payments
 * @param {Payment.model} payment.body.required - objeto contendo os dados do pagamento
  * @returns {object} 200 - Objeto contendo as informações do pagamento
 * @returns {Error}  default - Unexpected error
 */
router.post('/', function(req, res){
    paymentService.create(req.body).then(document => {
        res.json(document)
    }).catch(reason => { 
        res.json(reason) 
    })
})

/**
 * Lista os pagamentos já realizados
 * @route GET /list
 * @group payments - Operations about payments
  * @returns {object} 200 - Objeto contendo as informações do pagamento
 * @returns {Error}  default - Unexpected error
 */
router.get('/list', function(req, res){
    res.json(paymentService.list());    
})

/**
 * Retorna o estado total dos dados gravados no banco
 * @route GET /state
 * @group payments - Operations about payments
  * @returns {object} 200 - Objeto contendo as informações do pagamento
 * @returns {Error}  default - Unexpected error
 */
router.get('/state', (req, res) => {
    res.json(paymentService.state());
})

/**
 * Retorna um pagamento específico
 * @route GET /:paymentId
 * @group payments - Operations about payments
 * @param {string} paymentId - ID único do pagamento
  * @returns {object} 200 - Objeto contendo as informações do pagamento
 * @returns {Error}  default - Unexpected error
 */
router.get('/:paymentId', function(req, res){
    res.json(paymentService.find(req.params.paymentId));    
})

/**
 * Lista as transações de um pagamento específico
 * @route GET /:paymentId/transactions
 * @group payments - Operations about payments
 * @param {string} paymentId - ID único do pagamento
  * @returns {object} 200 - Objeto contendo as informações do pagamento
 * @returns {Error}  default - Unexpected error
 */
router.get('/:paymentId/transactions', (req, res) => {
    res.json(paymentService.transactions(req.params.paymentId));
})

/**
 * Aprova o pagamaento já criado e realiza a chamada à callBackUrl passada na hora da criação do pagamento
 * @route GET /:paymentId/approve
 * @group payments - Operations about payments
 * @param {string} paymentId - ID único do pagamento
  * @returns {object} 200 - Objeto contendo as informações do pagamento
 * @returns {Error}  default - Unexpected error
 */
router.get('/:paymentId/approve', (req, res) => {
    paymentService.approve(req.params.paymentId).then((payment) => {
        res.json(payment);
    })
    .catch((reason) => {
        res.status(reason.httpCode).send(reason.message)
    })
    
})

/**
 * Nega o pagamaento já criado e realiza a chamada à callBackUrl passada na hora da criação do pagamento
 * @route GET /:paymentId/deny
 * @group payments - Operations about payments
 * @param {string} paymentId - ID único do pagamento
  * @returns {object} 200 - Objeto contendo as informações do pagamento
 * @returns {Error}  default - Unexpected error
 */
router.get('/:paymentId/deny', (req, res) => {
    paymentService.deny(req.params.paymentId).then((payment) => {
        res.json(payment);
    })
    .catch((reason) => {
        res.status(reason.httpCode).send(reason.message)
    })
})

module.exports = router;
