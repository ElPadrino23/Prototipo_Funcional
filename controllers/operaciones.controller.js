// Controlador de operaciones

const modelOperaciones = require('../models/operaciones.model');
const modelClientes    = require('../models/clientes.model');
const modelAlertas     = require('../models/alertas.model');

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
    try {
        const resultado = await modelClientes.ObtenerClientesLista();
        res.render('./operaciones/agregar_operacion', {
            clientes: resultado.clientes || []
        });
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Procesar nueva operacion via API
module.exports.AgregarOperacion = async (req, res) => {
    try {
        const datos = {
            idcliente:     req.body.idCliente     || req.body.idcliente,
            producto:      req.body.producto      || 'General',
            tipooperacion: req.body.tipoOperacion || req.body.tipooperacion,
            monto:         req.body.monto,
            moneda:        req.body.moneda        || 'MXN',
            fecha:         req.body.fecha
        };

        const resultado = await modelOperaciones.AgregarOperacion(datos);

        if (resultado.exito) {
            await modelAlertas.GenerarAlertaSiAplica(resultado.operacion);
            res.json({ exito: true, msg: 'Operacion registrada para validacion' });
        } else {
            res.status(400).json({ exito: false, msg: resultado.error });
        }
    } catch (error) {
        res.status(500).json({ exito: false, msg: error.message });
    }
};
