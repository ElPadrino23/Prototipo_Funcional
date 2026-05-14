// Controlador de historial de acciones y eventos del sistema

const modelHistorial = require('../models/historial.model');

// Obtener historial general
module.exports.ObtenerHistorial = async (req, res) => {
    const resultado = await modelHistorial.ObtenerHistorial();
    res.render('./historial/lista_historial', {
        registros: resultado.registros,
        filtro:    null
    });
};

// Historial filtrado por usuario
module.exports.HistorialPorUsuario = async (req, res) => {
    const resultado = await modelHistorial.ObtenerHistorialPorUsuario(req.query.id);
    res.render('./historial/lista_historial', {
        registros: resultado.registros,
        filtro:    'usuario'
    });
};

// Historial filtrado por tipo de accion
module.exports.HistorialPorAccion = async (req, res) => {
    const resultado = await modelHistorial.ObtenerHistorialPorAccion(req.query.accion);
    res.render('./historial/lista_historial', {
        registros: resultado.registros,
        filtro:    req.query.accion
    });
};

// Detalles de un evento especifico
module.exports.DetalleEvento = async (req, res) => {
    const resultado = await modelHistorial.ObtenerEventoPorId(req.query.id);
    res.render('./historial/lista_historial', {
        registros: resultado.registro ? [resultado.registro] : [],
        filtro:    'detalle'
    });
};
