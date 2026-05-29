const modelBuzon = require('../models/buzon_interno.model');

module.exports.Lista = async (req, res) => {
    const resultado = await modelBuzon.ObtenerReportes();
    res.render('./buzon_interno/lista_buzon_interno', {
        reportes: resultado.reportes,
        mensaje:  req.query.mensaje || null
    });
};

module.exports.VistaAgregar = async (req, res) => {
    res.render('./buzon_interno/agregar_buzon_interno');
};

module.exports.Agregar = async (req, res) => {
    await modelBuzon.CrearReporte(req.body);
    res.redirect('/buzon-interno/lista');
};

module.exports.Actualizar = async (req, res) => {
    await modelBuzon.ActualizarReporte(req.body.id, req.body);
    res.redirect('/buzon-interno/lista');
};
