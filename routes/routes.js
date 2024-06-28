const router = require('express').Router();
const colasController = require('../controllers/colasController')


router.get('/',colasController.index);
router.post('/cola',colasController.cola);
router.post('/generateTicket',colasController.genTicket);
router.get('/ticketCliente/:ticket',colasController.ticket);
router.get('/agente', colasController.agente)
router.get('/secuencia',colasController.secuenciaColas);
router.post('/tomarTicket',colasController.tomarTicket);
router.post('/atenderAnular',colasController.atenderAnular);


module.exports = router;