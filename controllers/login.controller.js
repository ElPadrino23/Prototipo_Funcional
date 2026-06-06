// Controller login y autenticacion

const modelLogin = require('../models/login.model');

// Vista de login
module.exports.VistaLogin = async (req, res) => {
    res.render('./login/login', {
        mensaje: req.query.mensaje || null
    });
};

// Procesar login
module.exports.ProcesarLogin = async (req, res) => {
    const { correo, password } = req.body;

    try {
        const usuario = await modelLogin.ValidarCredenciales(correo, password);

        if (usuario) {
            req.session.usuario = usuario;
            return res.redirect(usuario.rol === 'Cliente' ? '/mi-expediente' : '/dashboard');
        }

        res.redirect('/login?mensaje=Datos incorrectos. Verifica tu correo y contraseña.');
    } catch (error) {
        res.redirect('/login?mensaje=No fue posible conectar con la base de datos.');
    }
};

// Logout
module.exports.Logout = async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};

module.exports.VistaRegistro    = async (req, res) => res.redirect('/login');
module.exports.ProcesarRegistro = async (req, res) => res.redirect('/login');
