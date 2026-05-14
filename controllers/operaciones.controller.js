// Controlador de operaciones

const modelOperaciones = require('../models/operaciones.model');
const modelClientes    = require('../models/clientes.model');

// Vista lista de operaciones
module.exports.ObtenerOperaciones = async (req, res) => {
    res.render('./operaciones/lista_operaciones', {
        mensaje: req.query.mensaje || null
    });
};

// API: devuelve operaciones como JSON para el frontend
module.exports.ApiListaOperaciones = async (req, res) => {
    try {
        const resultado = await modelOperaciones.ObtenerOperaciones();
        const operaciones = (resultado.operaciones || []).map(function(o) {
            return {
                idOperacion:   o.idoperacion,
                cliente:       o.idcliente || '',
                contrato:      o.idcontrato || '',
                producto:      o.producto || '',
                tipoOperacion: o.tipooperacion || '',
                monto:         o.monto || 0,
                moneda:        o.moneda || 'MXN',
                fecha:         o.fecha || '',
                estatus:       o.estatus || ''
            };
        });
        res.json({ operaciones: operaciones });
    } catch (error) {
        res.status(503).json({ msg: 'Error al obtener operaciones', detalle: error.message });
    }
};

// Vista formulario agregar operacion
module.exports.VistaAgregarOperacion = async (req, res) => {
    res.render('./operaciones/agregar_operacion', {
        mensaje: null
    });
};

// Procesar nueva operacion via API
module.exports.AgregarOperacion = async (req, res) => {
    try {
        const resultado = await modelOperaciones.AgregarOperacion(req.body);
        if (resultado.exito) {
            res.json({ exito: true, msg: 'Operacion registrada para validacion' });
        } else {
            res.status(400).json({ exito: false, msg: resultado.error });
        }
    } catch (error) {
        res.status(500).json({ exito: false, msg: error.message });
    }
};
