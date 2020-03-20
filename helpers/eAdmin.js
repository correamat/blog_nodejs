module.exports = {
    eAdmin: function (req, res, next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }

        req.flash("error_msg", "Você precisa estar logado para acessar essa área");
        res.redirect("/usuarios/login");
    }
}