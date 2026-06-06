// Controller login y autenticacion

const modelLogin = require('../models/login.model');

const usuariosDemo = [
    { correo: 'demo@sofom.mx',     password: 'demo123',     nombre: 'Usuario Demo',  rol: 'Oficial de Cumplimiento' },
    { correo: 'analista@sofom.mx', password: 'analista123', nombre: 'Ana González',  rol: 'Analista'                },
    { correo: 'cliente@sofom.mx',  password: 'cliente123',  nombre: 'Carlos López',  rol: 'Cliente'                 }
];

// Vista de login
module.exports.VistaLogin = async (req, res) => {
    res.render('./login/login', {
        usuariosDemo: usuariosDemo,
        mensaje:      req.query.mensaje || null
    });
};

// Procesar login
module.exports.ProcesarLogin = async (req, res) => {
    const { correo, password } = req.body;

    // Verificar contra usuarios demo hardcodeados
    const demo = usuariosDemo.find(u => u.correo === correo && u.password === password);
    if (demo) {
        req.session.usuario = { id: 0, nombre: demo.nombre, correo: demo.correo, rol: demo.rol };
        return res.redirect(demo.rol === 'Cliente' ? '/buzon-interno/lista' : '/dashboard');
    }

    try {
        const usuario = await modelLogin.ValidarCredenciales(correo, password);

        if (usuario) {
            req.session.usuario = usuario;
            return res.redirect(usuario.rol === 'Cliente' ? '/buzon-interno/lista' : '/dashboard');
        }

        res.redirect('/login?mensaje=Datos incorrectos. Verifica tu correo y contraseña.');
    } catch (error) {
        res.redirect('/login?mensaje=No fue posible conectar con la base de datos. Usa el acceso rápido.');
    }
};

// Logout
module.exports.Logout = async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};

module.exports.VistaRegistro  = async (req, res) => res.render('./login/login', { usuariosDemo, mensaje: null });
module.exports.ProcesarRegistro = async (req, res) => res.redirect('/login');
