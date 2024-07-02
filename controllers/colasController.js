const {Cliente,Servicios,Agente} = require('../models/models');
const {bot} = require('./telegram');
require('dotenv').config()
const {WebSocket} = require('ws'); 

const socket = new WebSocket.Server({port: process.env.WS_PORT},()=>{
    console.log('WebSocket start on '+process.env.WS_PORT)
})

const clients = {};
const comand = {};
let clientId; 

socket.on('connection', (ws,req) =>{
    console.log('Nueva conexion al websocket')
    ws.on('message', data =>{
        data = JSON.parse(data);
        clientId = data.id
        console.log('Cliente: '+ clientId)
        clients[clientId] = ws;
        clients[clientId].nombre = clientId;
    });
    ws.onerror = function (err){
        console.log(err)
    }
    ws.on('close', ()=>{
        delete clients[clientId]
        console.log('Conexion del cliente ' +clientId+' cerrada');
    });
});   


module.exports.index = (req,res)=>{
    //req.session.destroy()
    res.render('home');
}

module.exports.cola = async (req,res)=>{
    let cliente = await JSON.stringify(req.body);
    let  servicios = await Servicios.show();
    res.render('colas',{cliente,servicios});

};

module.exports.genTicket = async (req,res)=>{
    let ticket;
    //console.log(req.body)
    const data = req.body;
    let numero = 0;
    let servicio = await Servicios.findOne(data.servicio);
    let tiempo_espera = servicio.tiempo_espera;
    servicio = servicio._id;

    function secuenciaNumeros(cola,number){
        function pad(number_aux, length) {
            return String(number_aux).padStart(length, '0');
        }
        let siguienteNumero = pad((number + 1), 3)
        if (siguienteNumero <= 999){
            siguienteNumero = cola + siguienteNumero;
        }else{
            siguienteNumero = cola + '000'
        }
        return siguienteNumero;
    };
    numero = await Cliente.findLastTicket(servicio);
    //console.log(numero.ticket)
    numero ? numero = Number(numero.ticket.replace(/\D/g,'')) : numero = -1;
    console.log("el numero: "+numero)
    ticket = secuenciaNumeros(data.servicio,numero);
    let dataCliente = data;
    dataCliente.servicio = servicio;
    dataCliente.ticket = ticket;
    console.log('El ticket: '+dataCliente.ticket);
    dataCliente.tiempo_espera = tiempo_espera;
    let nuevoTicket = await Cliente.creteOne(dataCliente); 
    if(nuevoTicket){
        res.status(200).json({status:true, ticket:ticket});
        process.emit('ticket',{ticket:nuevoTicket});
    }else{
        res.status(501).json({status:false});
    }
    //console.log(nuevoTicket);
};

module.exports.ticket = (req,res)=>{
    res.send(req.params.ticket);
};

module.exports.agente = async (req,res) =>{
    let agente = await Agente.findOneP00('212951');
    req.session.agente = agente.nombre;
    req.session.p00 = agente.p00;
    let updateTicketsOld = await Cliente.updateOneStatusOnReload('atendido',agente._id);
    console.log(updateTicketsOld);
    let cliente = await Cliente.findPrimeroEnColaAgente();
    res.render('agente',{agente: req.session.agente,cliente});
    async function Busqueda(){
        try {
            cliente = await Cliente.findPrimeroEnColaAgente();
            Object.values(clients).forEach(client =>{
                if(client.nombre == agente.nombre){
                    console.log('el websocket es: '+agente.nombre);
                    //console.log(client);
                    client.send(JSON.stringify(cliente))
                }
            })
            //clients[agente.nombre].send(JSON.stringify(cliente))
            return cliente 
        } catch (error) {
            console.log(error);
        }
    
    }

    process.on('ticket', (item)=>{

        Busqueda();
    });
    process.on('atendido', (item)=>{
        console.log('Ejecutando busqueda luego de atencion')
        Busqueda();
    });

    console.log(agente);
    console.log(req.session)
};

module.exports.tomarTicket = async (req,res) => {

    let agente = await Agente.findOneP00(req.session.p00);
    const id = req.body.ticket.length != 0 ? req.body.ticket : 0;
    if (id != 0){
        let atencion = await Cliente.updateOneStatus(id,'atendiendo',agente._id);
        res.status(200).json({status:true});
        process.emit('ticket',{ticket:true});
        process.emit('agente',{ticket:true});
        const ticket = await Cliente.findOne(id);
        console.log(ticket)
        bot.telegram.sendMessage('@GestorColasMovilnet','EL tiket: '+ticket.ticket+ 'esta siendo llamado por el agente: '+ticket.agenteId.nombre + ' '+ticket.agenteId.apellido)
    }else{
        console.log('Sin acciones');
        res.status(200).json({status:false});
    }

};

module.exports.atenderAnular = async (req,res) => {
    let agente = await Agente.findOneP00(req.session.p00);
    const id = req.body.ticket.length != 0 ? req.body.ticket : 0;

    let atencion;
    if (id != 0){
        switch (req.body.accion){
            case 'cerrar':
                console.log('atendido')
                atencion = await Cliente.updateOneStatus(id,'atendido',agente._id);
                res.status(200).json({status:true});
                process.emit('atendido',{ticket:true});
            break;
            case 'anular':
                console.log('anulado')
                atencion = await Cliente.updateOneStatus(id,'anulado',agente._id);
                res.status(200).json({status:true});
                process.emit('atendido',{ticket:true});
            break;
        }
        

    }else{
        console.log('Sin acciones');
        res.status(200).json({status:false});
    }
}

module.exports.secuenciaColas = async (req,res) =>{
    const servicios = await Servicios.show();
    req.session.oficina = 'oficina1'
    res.render('secuenciaColas',{oficina:req.session.oficina,servicios});
    let oficina = await req.session.oficina;
    async function Busqueda(){
        oficina = req.session.oficina;
        console.log('buscando tickets')
        let clientes = {}
        servicios.forEach(async (element) => {
            try {
                clientes[element._id] = await Cliente.findPrimeroEnCola(element._id);
                console.log('Tickets econtrados: ');
                //console.log(clients)
                Object.values(clients).forEach(client =>{
                    if(client.nombre == 'oficina1'){
                        console.log('El websocket es: Oficina1')
                        client.send(JSON.stringify(clientes))
                    }
                })
                //clients['oficina1'].send(JSON.stringify(clientes))
            } catch (error) {
                console.log(error)
            }
        });
        
    }
    process.on('atendido', (item)=>{
        Busqueda();
    })
    process.on('agente', (item)=>{
        Busqueda();
    })

};

module.exports.siguienteNumero = async (req,res) =>{

}

async function sendHola(oficina){
    while (true){
        clients[oficina].send('hola')
        //console.log('hola')
        await new Promise((resolve, reject) => {setTimeout(() => {resolve()}, 3000);})
    }
}
