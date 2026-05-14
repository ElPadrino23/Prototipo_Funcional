// Controller de alertas PLD

const modelAlertas   = require('../models/alertas.model');
const modelHistorial = require('../models/historial.model');
const supabase       = require('../config/supabase');

// Vista lista de alertas
module.exports.ObtenerAlertas = async (req, res) => {
    res.render('./alertas/lista_alertas', {
        mensaje: req.query.mensaje || null
    });
};

// API: devuelve alertas como JSON para el frontend
module.exports.ApiListaAlertas = async (req, res) => {
    try {
        const resultado = await modelAlertas.ObtenerAlertas();
        const alertas = (resultado.alertas || []).map(function(a) {
            return {
                idAlerta:    a.idalerta,
                cliente:     a.idcliente || '',
                operacion:   a.idoperacion || '',
                regla:       a.regla || '',
                nivel:       a.nivel || 'Bajo',
                fecha:       a.fecha || '',
                responsable: a.responsable || '',
                estatus:     a.estatus || 'Pendiente'
            };
        });
        res.json({ alertas: alertas });
    } catch (error) {
        res.status(503).json({ msg: 'Error al obtener alertas', detalle: error.message });
    }
};

// API: resolver una alerta
module.exports.ApiResolverAlerta = async (req, res) => {
    try {
        const { idAlerta, resolucion } = req.body;
        if (!idAlerta) {
            return res.status(400).json({ msg: 'Falta idAlerta' });
        }
        const resultado = await modelAlertas.ResolverAlerta(idAlerta, { resolucion: resolucion || '' });
        res.json({ exito: resultado.exito, msg: 'Alerta resuelta' });
    } catch (error) {
        res.status(503).json({ msg: 'Error al resolver alerta', detalle: error.message });
    }
};

// Vista formulario resolver alerta
module.exports.VistaResolverAlerta = async (req, res) => {
    res.render('./alertas/lista_alertas', { mensaje: null });
};

// Procesar resolucion de alerta
module.exports.ResolverAlerta = async (req, res) => {
    res.redirect('/alertas/lista');
};

// API: cambiar estatus de alerta (Pendiente -> En revision)
module.exports.ApiCambiarEstatus = async (req, res) => {
    try {
        const { idAlerta, estatus } = req.body;
        const resultado = await modelAlertas.CambiarEstatus(idAlerta, estatus);
        res.json({ exito: resultado.exito });
    } catch (error) {
        res.status(503).json({ msg: 'Error al cambiar estatus', detalle: error.message });
    }
};

// Vista detalle de alerta con historial del cliente
module.exports.VistaDetalleAlerta = async (req, res) => {
    try {
        const idAlerta = req.query.id;
        if (!idAlerta) return res.redirect('/alertas/lista');

        const resAlerta = await modelAlertas.ObtenerAlertaPorId(idAlerta);
        if (!resAlerta.exito) return res.redirect('/alertas/lista');

        const alerta = resAlerta.alerta;

        const [resCliente, resOps] = await Promise.all([
            supabase.from('cliente').select('*').eq('idcliente', alerta.idcliente).single(),
            supabase.from('operacion').select('*').eq('idcliente', alerta.idcliente).order('idoperacion', { ascending: false })
        ]);

        res.render('./alertas/detalle_alerta', {
            alerta:     alerta,
            cliente:    resCliente.data || null,
            operaciones: resOps.data || []
        });
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Procesar resolucion desde el detalle
module.exports.ProcesarResolucion = async (req, res) => {
    try {
        await modelAlertas.ResolverAlerta(req.body.idAlerta, { resolucion: req.body.resolucion || '' });
        modelHistorial.RegistrarAccion({ accion: 'Resolver alerta', entidad: 'alerta', entidad_id: req.body.idAlerta, ip_origen: req.ip });
    } catch (e) {}
    res.redirect('/alertas/lista');
};
