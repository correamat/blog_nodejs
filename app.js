//INICIALIZANDO MODULOS 

const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const rotasAdmin = require('./routes/admin');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
//Configurações
    //SESSION
    app.use(session({
        secret: "pasteldeflango",
        resave: true,
        saveUninitialized: true
    }));

    //FLASH
    app.use(flash());

     //MIDDLEWARE
    app.use((req, res, next) => {
        //res.locals -> variavel global é assim que eu crio.
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        next(); //PARA AVANÇAR SE EU NÃO TIVER O NEXT ELE VAI FICAR INFINITAMENTE AI
    });

    //bodyParser
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    //handlebars
    app.engine('handlebars', handlebars({
        defaultLayout: 'main',
        allowedProtoMethods: true,
        allowProtoMethodsByDefault: true
        }
    ));
    app.set('view engine', 'handlebars');

    //Mongoose
    mongoose.connect("mongodb://localhost/blogapp", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() =>{
        console.log("Conectado ao mongo");
    }).catch((err) => {
        console.log("Erro ao se conectar no mongo: " + err);
    });

    //PASTA PUBLIC
    app.use(express.static(path.join(__dirname, "public")));
    

// ROTAS
app.use('/admin', rotasAdmin);

// OUTROS
const PORT = 8081;
app.listen(PORT, () => {
    console.log("Servidor rodando");
});
