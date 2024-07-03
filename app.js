require('dotenv').config();
const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const bodyParser = require('body-parser');
var expressWs = require('express-ws');
expressWs(app);

const routes = require('./routes/routes');

const port = process.env.HTTP_PORT

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'Gesto de colas movilnet' 
}))

// Permitir CORS para todas las rutas
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Reemplaza '*' con tu dominio específico si es necesario
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);
app.use(express.static('/public'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/public', express.static(__dirname + '/public'));
app.use('/js', express.static(__dirname + '/node_modules/sweetalert2/dist'));
app.use(routes);




app.listen(port,()=>{
    console.log('App runing on port: '+port);
})

