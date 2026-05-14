// Controlador de administracion de usuarios

const supabase  = require('../config/supabase');
const modelPEP  = require('../models/lista_pep.model');

// Vista lista de usuarios
module.exports.ListaUsuarios = async (req, res) => {
    res.render('./admin/lista_admin', {
        mensaje: req.query.mensaje || null
    });
};

// API: devuelve usuarios como JSON para el frontend
module.exports.ApiListaUsuarios = async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('usuario')
            .select('*')
            .order('idusuario', { ascending: false });

        if (error) throw new Error(error.message);

        const usuarios = (rows || []).map(function(u) {
            return {
                idUsuario: u.idusuario || u.id_usuario || u.id,
                nombre:    [u.nombre || '', u.apellido || ''].join(' ').trim(),
                correo:    u.correo || u.email || '',
                rol:       u.rol || 'Usuario',
                estado:    u.activo === false ? 'Inactivo' : 'Activo'
            };
        });

        res.json({ usuarios: usuarios });
    } catch (error) {
        // Tabla no creada aun - devolver vacio sin romper el frontend
        res.json({ usuarios: [], nota: 'Tabla usuario pendiente en Supabase' });
    }
};

module.exports.VistaAgregarUsuario = async (req, res) => {
    res.render('./admin/agregar_usuario');
};

module.exports.AgregarUsuario = async (req, res) => {
    try {
        await supabase.from('usuario').insert([{
            nombre:   req.body.nombre,
            apellido: req.body.apellido || '',
            correo:   req.body.correo,
            rol:      req.body.rol,
            password: req.body.password,
            activo:   true
        }]);
    } catch (e) {}
    res.redirect('/admin/lista');
};

module.exports.VistaEditarUsuario = async (req, res) => {
    try {
        const { data } = await supabase.from('usuario').select('*').eq('idusuario', req.query.id).single();
        res.render('./admin/editar_usuario', { usuario: data });
    } catch (e) {
        res.redirect('/admin/lista');
    }
};

module.exports.EditarUsuario = async (req, res) => {
    try {
        await supabase.from('usuario')
            .update({ nombre: req.body.nombre, apellido: req.body.apellido || '', rol: req.body.rol })
            .eq('idusuario', req.body.idusuario);
    } catch (e) {}
    res.redirect('/admin/lista');
};

module.exports.EliminarUsuario = async (req, res) => {
    try {
        await supabase.from('usuario').delete().eq('idusuario', req.body.idusuario);
    } catch (e) {}
    res.redirect('/admin/lista');
};

// Lista PEP
module.exports.ListaPEP = async (req, res) => {
    const resultado = await modelPEP.ObtenerListaPEP();
    res.render('./admin/lista_pep', {
        lista:   resultado.lista,
        mensaje: req.query.mensaje || null
    });
};

module.exports.AgregarPEP = async (req, res) => {
    await modelPEP.AgregarEntradaPEP(req.body);
    res.redirect('/admin/pep');
};

module.exports.EliminarPEP = async (req, res) => {
    await modelPEP.EliminarEntradaPEP(req.body.id);
    res.redirect('/admin/pep');
};
