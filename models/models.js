const { mongo, default: mongoose,Schema } = require('./db');


const servicioSchema = new mongoose.Schema({
    descripcion: {
        type: String,
        unique: false,
        required: true,
    },
    tiempo_espera:{
        type: Number,
        required: true,
        unique: false,
    },
    codigo: {
        type: String,
        unique: true,
        required: true,  
    }
},{
    timestamps: true
},{
    collection: "clientes"
} );

const servicioModel = new mongoose.model('servicios',servicioSchema);


const clienteSchema = new mongoose.Schema({
    cedula: {
        type: String,
        unique: false,
        required: true,
    },
    telefono: {
        type: String,
        unique: false,
        required: false,
    },
    servicio: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: servicioModel,
    },
    ticket: {
        type: String,
        unique: false,
        required: true,
    },
    status:{
        type: String,
        required: true,
        unique: false,
        default: 'espera'
    },
    notificado:{
        type: Boolean,
        required: true,
        unique: false,
        default: false
    },
    tiempo_espera:{
        type: Number,
        required: true,
        unique: false,
    },
    tipo:{
        type: Number,
        required: true,
        unique: false,
    }
},{
    timestamps: true
},{
    collection: "clientes"
} );

const clienteModel = new mongoose.model('clientes',clienteSchema);




class Cliente{
    static async show(){
        try {
            const clientes = await clienteModel.find();
            return clientes;
        } catch (error) {
            console.error(new Error(error));
            return false;
        }
    };
    static async creteOne(data){
        try {
            const cliente = await clienteModel(data);
            await cliente.save();
            return cliente;
        } catch (error) {
            console.log(error);
            return false;
        }
    };
    static async findLastTicket(n){
        console.log(n)
        try {
            const clientes = await clienteModel.findOne({servicio:n}).sort({_id: -1});
            return clientes;
        } catch (error) {
            console.error(new Error(error));
            return false;
        }
    };
    static async findPrimeroEnCola(n){
        console.log()
        try {
            const clientes = await clienteModel.findOne({status:'atendiendo',servicio:n}).sort({_id: 1});
            return clientes;
        } catch (error) {
            console.error(new Error(error));
            return false;
        }
    };
    static async findPrimeroEnColaAgente(){
        console.log()
        try {
            const clientes = await clienteModel.findOne({status:'espera'}).sort({_id: 1});
            return clientes;
        } catch (error) {
            console.error(new Error(error));
            return false;
        }
    };
    static async updateOneStatus(id,status){
        console.log(id)
        try {
            const up = await clienteModel.updateOne(
                {_id:id},
                {$set:{
                    status: status
                    }
                }
            )
            return true;
        } catch (error) {
            console.error(error);
            return false
        }
    }
};

class Servicios{
    static async show(){
        try {
            const servicios = await servicioModel.find();
            return servicios;
        } catch (error) {
            console.error(new Error(error));
            return false;
        }
    }; 
    static async findOne(n){
        try {
            const servicios = await servicioModel.findOne({codigo:n});
            return servicios;
        } catch (error) {
            console.error(new Error(error));
            return false;
        }
    }; 
}


async function seed(){
    dataServices = [
        {
            descripcion: 'Adquirir linea',
            tiempo_espera: 30,
            codigo: 'AD',
        },
        {
            descripcion: 'Migrar tecnologia',
            tiempo_espera: 30,
            codigo: 'MI',
        },
        {
            descripcion: 'Actualizar datos',
            tiempo_espera: 20,
            codigo: 'AC',
        },
        {
            descripcion: 'Robo o perdida',
            tiempo_espera: 10,
            codigo: 'RB',
        },
    ];
    const valid = await servicioModel.find();
    if(valid.length != 0){
        console.log('Servicios ya existen')
    }else{
        await servicioModel.insertMany(dataServices);
    }
}

seed();


module.exports = {Cliente,Servicios}