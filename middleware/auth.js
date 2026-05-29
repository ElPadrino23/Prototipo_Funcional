// Aqui lo que buscamos soluccionar es que para entrar al dashboard 
// principal primero sea necesario autenticar al perfil
// ya que unicamente con el link era psoible entrar
// VOy a utilzar express-session

module.exports = function(req, res, next) {
    if (req.session && req.session.usuario) {
        return next();
    }
    res.redirect('/login');
};

