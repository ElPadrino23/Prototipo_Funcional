// Controlador de umbrales y criterios PLD

const modelReglas = require('../models/reglas.model');

// Obtener todas las reglas
module.exports.ObtenerReglas = async (req, res) => {
    const resultado = await modelReglas.ObtenerReglas();
    res.render('./reglas/lista_reglas', {
        reglas:  resultado.reglas,
        mensaje: req.query.mensaje || null
    });
};

// Vista para agregar regla
module.exports.VistaAgregarRegla = async (req, res) => {
    res.render('./reglas/agregar_regla');
};

// Agregar nueva regla
module.exports.AgregarRegla = async (req, res) => {
    await modelReglas.CrearRegla(req.body);
    res.redirect('/reglas/lista');
};

// Vista para editar regla
module.exports.VistaEditarRegla = async (req, res) => {
    const resultado = await modelReglas.ObtenerReglaPorId(req.query.id);
    res.render('./reglas/editar_regla', { regla: resultado.regla });
};

// Editar regla existente
module.exports.EditarRegla = async (req, res) => {
    await modelReglas.ActualizarRegla(req.body.idregla, req.body);
    res.redirect('/reglas/lista');
};

// Eliminar regla
module.exports.EliminarRegla = async (req, res) => {
    await modelReglas.EliminarRegla(req.body.idregla);
    res.redirect('/reglas/lista');
};
