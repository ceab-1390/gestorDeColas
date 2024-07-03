const router = require('express').Router();
const colasController = require('../controllers/colasController')
const webs = require('../controllers/ws');
router.get('/',colasController.index);
router.post('/cola',colasController.cola);
router.post('/generateTicket',colasController.genTicket);
router.get('/ticketCliente/:ticket',colasController.ticket);
router.get('/agente', colasController.agente)
router.get('/secuencia',colasController.secuenciaColas);
router.post('/tomarTicket',colasController.tomarTicket);
router.post('/atenderAnular',colasController.atenderAnular);


router.ws('/ws',(ws,req)=>{
    console.log('Express-ws-routes')
    //console.log(ws);

    ws.on('message', function(msg) {
        console.log(JSON.parse(msg));
        let opc = JSON.parse(msg)
        if(opc.id == 'oficina1'){
            console.log("Conexion de la oficina 1")
            //process.emit('oficina-connect',{ws});
            webs.setWs('oficina1',ws);

        }else{
            webs.setWs(opc.id,ws);
        }
      });


})



async function sendHola(ws){
    while (true){
        ws.send(JSON.stringify({"datos":"estos son los datos"}))
        console.log('hola')
        await new Promise((resolve, reject) => {setTimeout(() => {resolve()}, 3000);})
    }
}


module.exports = router;