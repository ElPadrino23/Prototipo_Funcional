// Verifica que exista una sesión activa
const verificarSesion = function(req, res, next) {
    if (req.session && req.session.usuario) {
        return next();
    }
    res.redirect('/login');
};

// Verifica que el rol del usuario esté en la lista de roles permitidos
const verificarRol = function(...roles) {
    return function(req, res, next) {
        if (!req.session || !req.session.usuario) {
            return res.redirect('/login');
        }
        if (roles.includes(req.session.usuario.rol)) {
            return next();
        }
        res.redirect('/dashboard?mensaje=No tienes permiso para acceder a esa sección.');
    };
};

module.exports            = verificarSesion;
module.exports.verificarRol = verificarRol;
