const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

require('../models/Categoria');
const Categoria = mongoose.model("categorias");

require('../models/Postagem');
const Postagem = mongoose.model("postagens");

router.get('/', (req, res) => {
    res.render("admin/index");
});

router.get('/posts', (req, res) => {
    res.send("Página de posts");
});

router.get('/categorias', (req, res) => {
    Categoria.find().sort({date: "desc"}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias});
    }).catch(() => {
        req.flash("error_msg", "Ocorreu um erro ao listar as categorias");
        res.redirect("/admin");
    });
});

router.get('/categorias/add', (req, res) => {
    res.render("admin/addcategorias");
});

router.post('/categorias/nova', (req, res) => {
    let erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({
            text: "Nome inválido"
        });
    }else if(req.body.nome.length < 2){
        erros.push({
            text: "Nome da categoria muito pequeno."
        });
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({
            text: "Slug inválido"
        });
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {
            erros: erros
        })
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            //res.json({retorno: true, msg: "Categoria salva com sucesso."});
            req.flash("success_msg", "Categoria criada com sucesso.");
            res.redirect('/admin/categorias');
        }).catch((err) => {
            //res.json({retorno: false, msg: "Ocorreu um erro ao salvar a categoria: " + err});
            req.flash("error_msg", "Ocorreu um erro ao salvar a categoria, tente novamente.");
            res.redirect('/admin')
        });
    }    
});

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({
        _id: req.params.id
    }).then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria});
    }).catch((err) => {
        req.flash("error_msg", "Essa categoria não existe");
        res.redirect("/admin/categorias");
    });
});

router.post('/categorias/edit', (req, res) => {

    let erros = [];

    if(!req.body.id || typeof req.body.id == undefined || req.body.id == null){
        erros.push({
            text: "id não encontrado."
        });
    }

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({
            text: "Nome inválido"
        });
    }else if(req.body.nome.length < 2){
        erros.push({
            text: "Nome da categoria muito pequeno."
        });
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({
            text: "Slug inválido"
        });
    }

    if(erros.length > 0){
        res.render("admin/editcategorias", {
            erros: erros
        })
    }else{
        Categoria.findOne({_id: req.body.id}).then((categoria) =>{
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;
    
            categoria.save().then(() => {
                req.flash("success_msg", "Categoria alterada com sucesso.");
                res.redirect("/admin/categorias");
            }).catch(() => {
                req.flash("error_msg", "Ocorreu um erro ao editar a categoria");
                res.redirect("/admin/categorias");
            });
        }).catch((err) => {
            req.flash("error_msg", "Ocorreu um erro ao editar a categoria");
            res.redirect("/admin/categorias");
        });
    }

});

router.post('/categorias/deletar', (req, res) =>{
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso.");
        res.redirect("/admin/categorias");
    }).catch(() =>{
        req.flash("error_msg", "Houve um erro ao deletar a categoria.");
        res.redirect("/admin/categorias");
    });
});

router.get('/postagens', (req, res) => {
    res.render('admin/postagens');
});

router.get('/postagens/add', (req, res) => {
    Categoria.find().then((categorias)=>{
        res.render('admin/addpostagem', {categorias: categorias});
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o form de postagens.");
        res.redirect('/admin/postagens');
    });
});

router.post('/postagens/nova', (req, res) => {
    let erros = [];

    if(req.body.categoria == "0"){
        erros.push({
            text: "Selecione a categoria, ou cadastre uma categoria."
        });
    }

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({
            text: "Titulo inválido"
        });
    }else if(req.body.titulo.length < 2){
        erros.push({
            text: "Titulo da postagem muito pequeno."
        });
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({
            text: "Conteudo inválido"
        });
    }else if(req.body.conteudo.length < 2){
        erros.push({
            text: "Conteudo da postagem muito pequeno."
        });
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({
            text: "Descrição inválido"
        });
    }else if(req.body.descricao.length < 2){
        erros.push({
            text: "Descrição da postagem muito pequeno."
        });
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({
            text: "Slug inválido"
        });
    }

    if(erros.length > 0){
        Categoria.find().then((categorias) => {
            res.render("admin/addpostagem", {
                erros: erros,
                categorias: categorias
            });
        }).catch((err) => {
            res.render("admin/postagens", {
                erros: erros
            });
        });
        
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem cadastrada com sucesso.");
            res.redirect("/admin/postagens");
        }).catch((err) => {
            req.flash("error_msg", "Ocorreu um erro ao cadastrar a postagem, tente novamente. Erro: " + err);
            res.redirect("/admin/postagens");
        });
    }

});

module.exports = router;