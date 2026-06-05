// Controlador de contratos

const supabase = require('../config/supabase');

// Vista lista de contratos
module.exports.ObtenerContratos = async (req, res) => {
    res.render('./contratos/lista_contratos', {
        mensaje: req.query.mensaje || null
    });
};

// La api devuelve para frontend
module.exports.ApiListaContratos = async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('contrato')
            .select('*, cliente:idcliente(nombrerazonsocial)')
            .order('idcontrato', { ascending: false });

        if (error) throw new Error(error.message);

        const contratos = (rows || []).map(function(c) {
            return {
                idContrato:  c.idcontrato,
                cliente:     (c.cliente && c.cliente.nombrerazonsocial) || '',
                producto:    c.producto || '',
                inicio:      c.fechainicio || c.fecha_inicio || '',
                vencimiento: c.vencimiento || c.fecha_vencimiento || '',
                saldo:       c.saldo || 0,
                estatus:     c.estatus || ''
            };
        });

        res.json({ contratos: contratos });
    } catch (error) {
        // Tabla no creada aun - devolver vacio sin romper el frontend
        res.json({ contratos: [], nota: 'Tabla contrato pendiente en Supabase' });
    }
};

module.exports.VistaAgregarContrato = async (req, res) => {
    try {
        const { data: clientes } = await supabase.from('cliente').select('idcliente, nombrerazonsocial').order('idcliente');
        res.render('./contratos/agregar_contrato', { clientes: clientes || [] });
    } catch (e) {
        res.render('./contratos/agregar_contrato', { clientes: [] });
    }
};

module.exports.AgregarContrato = async (req, res) => {
    try {
        await supabase.from('contrato').insert([{
            idcliente:    req.body.idcliente,
            producto:     req.body.producto,
            fechainicio:  req.body.fechainicio,
            vencimiento:  req.body.vencimiento,
            saldo:        parseFloat(req.body.saldo) || 0,
            estatus:      'Activo'
        }]);
    } catch (e) {}
    res.redirect('/contratos/lista');
};
