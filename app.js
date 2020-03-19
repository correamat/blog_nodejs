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

require("./models/Postagem");
const Postagem = mongoose.model("postagens");

require("./models/Categoria");
const Categoria = mongoose.model("categorias");

const rotasUsuarios = require('./routes/usuario');

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
app.get('/', (req, res) => {
    Postagem.find().populate("categoria").sort({data: "DESC"}).then((postagens) => {
        res.render("index", {postagens: postagens});
    }).catch((err) => {
        req.flash("error_msg", "Ocorreu um erro ao renderizar a página: " + err);
        res.redirect("/404");
    });
});

app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({slug: req.params.slug}).then((postagem) => {
        if(postagem){
            res.render("postagem/index", {postagem: postagem});
        }else{
            req.flash("error_msg", "Esta postagem não existe.");
            res.redirect("/");
        }
    }).catch((err) => {
        req.flash("error_msg", "Esta postagem não existe.");
        res.redirect("/");
    });
});

app.get('/404', (req, res) => {
    res.send("Erro 404!");
});

app.get('/categorias', (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("categorias/index", {categorias: categorias});
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias");
        res.redirect("/");
    })
});

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if(categoria){
            Postagem.find({categoria: categoria._id}).then((postagens) => {
                res.render("categorias/postagens", {
                    postagens: postagens,
                    categoria: categoria
                });
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar os posts.");
                res.redirect("/categorias");
            });
        }else{
            req.flash("error_msg", "Essa categoria não existe.");
            res.redirect("/categorias");
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar página de posts dessa categoria.");
        res.redirect("/categorias");
   });
});

app.use('/admin', rotasAdmin);
app.use('/usuarios', rotasUsuarios);

// OUTROS
const PORT = 8081;
app.listen(PORT, () => {
    console.log("Servidor rodando");
});
