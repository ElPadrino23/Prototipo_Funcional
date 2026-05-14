// Controlador de reportes internos de conductas sospechosas

const modelRI = require('../models/reportes_internos.model');

module.exports.ListaReportesInternos = async (req, res) => {
    const resultado = await modelRI.ObtenerReportesInternos();
    res.render('./reportes_internos/lista_reportes_internos', {
        reportes: resultado.reportes,
        mensaje:  req.query.mensaje || null
    });
};

module.exports.VistaAgregarRI = async (req, res) => {
    res.render('./reportes_internos/agregar_reporte_interno');
};

module.exports.AgregarRI = async (req, res) => {
    await modelRI.CrearReporteInterno(req.body);
    res.redirect('/reportes-internos/lista');
};

module.exports.ActualizarRI = async (req, res) => {
    await modelRI.ActualizarReporteInterno(req.body.id, req.body);
    res.redirect('/reportes-internos/lista');
};
