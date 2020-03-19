const express = require('express');
const router = express.Router();
const mogoose = require('mongoose');
require('../models/Usuario');
const Usuario = mogoose.model("usuarios");
const bcrypt = require('bcryptjs');

router.get("/registro", (req, res) => {
    res.render("usuarios/registro");
});

router.post("/registro", (req, res) => {
    let erros = [];

    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null){
        erros.push({
            texto: "Nome inválido"
        });
    }

    if(!req.body.email || typeof req.body.email === undefined || req.body.email === null){
        erros.push({
            texto: "E-mail inválido"
        });
    }

    if(!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null){
        erros.push({
            texto: "Senha inválida"
        });
    }else if(req.body.senha.length < 4){
        erros.push({
            texto: "Senha curta"
        });
    }

    if(req.body.senha !== req.body.confirmar_senha){
        erros.push({
            texto: "As senhas são diferentes tente novamente."
        });
    }

    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros});
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Já existe uma conta com esse e-mail");
                res.redirect("/usuarios/registro");
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                });
                
                //salt vai deixar o hash bem maior do que 10
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("erro_msg", "Houve um erro durante o cadastro do usuário");
                            res.redirect("/registro");
                        }

                        novoUsuario.senha = hash;

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso.");
                            res.redirect("/");
                        }).catch((err) => {
                            req.flash("error_msg", "Ocorreu um erro ao registrar o usuário: " + err);
                            res.redirect("/usuarios/registro");
                        });
                    });
                });
            }

        }).catch((err) =>  {
            req.flash("error_msg", "Houve um erro interno");
            res.redirect("/");
        });
    }

});

router.get('/login', (req, res) => {
    res.render('usuarios/login');
});


module.exports = router;