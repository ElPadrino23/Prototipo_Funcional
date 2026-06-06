// Controlar todo el apartado de los clientes

const modelClientes  = require('../models/clientes.model');
const modelHistorial = require('../models/historial.model');
const supabase       = require('../config/supabase');

// NO TOCAR: esto jala los datos de la DB para mostrarlos
module.exports.ObtenerClientes = async (req, res) => {
    try {
        res.render('./clientes/lista_clientes', {
            mensaje: req.query.mensaje || null
        });
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Mostrar formulario de nuevo expediente
module.exports.VistaExpedienteCliente = async (req, res) => {
    try {
        res.render('./clientes/expediente_cliente');
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Recibir formulario y guardar cliente + documentos
module.exports.GuardarExpediente = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ exito: false, error: 'No se recibieron datos' });
        }

        const resultado = await modelClientes.GuardarCliente(req.body, req.files || {});

        if (resultado.exito) {
            modelHistorial.RegistrarAccion({ accion: 'Crear cliente', entidad: 'cliente', entidad_id: resultado.idCliente, ip_origen: req.ip });
            res.status(200).json({ exito: true, mensaje: resultado.mensaje, idCliente: resultado.idCliente });
        } else {
            res.status(400).json({ exito: false, error: resultado.error });
        }

    } catch (error) {
        res.status(500).json({ exito: false, error: error.message });
    }
};

// Agregar a un cliente enviar al expediente
module.exports.VistaAgregarCliente = async (req, res) => {
    try {
        res.render('./clientes/expediente_cliente');
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

module.exports.AgregarCliente = async (req, res) => {
    try {
        res.redirect('/clientes/lista');
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Solo lectura del expediente de los clientes, RF 2
module.exports.VistaEditarCliente = async (req, res) => {
    try {
        const idCliente = req.query.id;
        if (!idCliente) return res.redirect('/clientes/lista');

        const resultado = await modelClientes.ObtenerClientePorId(idCliente);
        if (!resultado.exito) return res.redirect('/clientes/lista');

        res.render('./clientes/editar_cliente', { cliente: resultado.cliente });
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// PErmite actualizar al cliente RF 3 
module.exports.EditarCliente = async (req, res) => {
    try {
        const { idCliente } = req.body;
        
        if (!idCliente) {
            return res.status(400).json({ exito: false, error: 'ID Cliente requerido' });
        }

        const datosActualizar = {
            nombrerazonsocial: req.body.nombre,
            rfc: req.body.rfc,
            correoelectronico: req.body.correo,
            telefono: req.body.telefono,
            tipocliente: req.body.tipoPersona,
            espep: req.body.esPep ? true : false
        };

        const resultado = await modelClientes.EditarCliente(idCliente, datosActualizar);

        if (resultado.exito) {
            modelHistorial.RegistrarAccion({ accion: 'Editar cliente', entidad: 'cliente', entidad_id: idCliente, ip_origen: req.ip });
            res.redirect('/clientes/editar?id=' + idCliente);
        } else {
            res.status(400).json({ exito: false, error: resultado.error });
        }
    } catch (error) {
        res.status(500).json({ exito: false, error: error.message });
    }
};

// Eliminar cliente
module.exports.EliminarCliente = async (req, res) => {
    try {
        res.redirect('/clientes/lista');
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// RF ver docuemntos del cliente
module.exports.VistaDocumentosCliente = async (req, res) => {
    try {
        const idCliente = req.query.id;
        if (!idCliente) return res.redirect('/clientes/lista');

        const resultado = await modelClientes.ObtenerClientePorId(idCliente);
        if (!resultado.exito) return res.redirect('/clientes/lista');

        const resultadoDocs = await modelClientes.ObtenerDocumentosCliente(idCliente);
        
        res.render('./clientes/documentos_cliente', { 
            cliente: resultado.cliente,
            documentos: resultadoDocs.documentos 
        });
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Vista detalle del cliente con pestanas (RF-02)
module.exports.VistaDetalleCliente = async (req, res) => {
    try {
        const idCliente = req.query.id;
        if (!idCliente) return res.redirect('/clientes/lista');

        const [resCliente, resDocs, resOps, resCons, resAlertas] = await Promise.all([
            modelClientes.ObtenerClientePorId(idCliente),
            modelClientes.ObtenerDocumentosCliente(idCliente),
            supabase.from('operacion').select('*').eq('idcliente', idCliente).order('idoperacion', { ascending: false }),
            supabase.from('contrato').select('*').eq('idcliente', idCliente).order('idcontrato', { ascending: false }),
            supabase.from('alerta').select('*').eq('idcliente', idCliente).order('idalerta', { ascending: false })
        ]);

        if (!resCliente.exito) return res.redirect('/clientes/lista');

        res.render('./clientes/detalle_cliente', {
            cliente:    resCliente.cliente,
            documentos: resDocs.documentos || [],
            operaciones: resOps.data || [],
            contratos:  resCons.data || [],
            alertas:    resAlertas.data || []
        });
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// API: devuelve clientes como JSON para el frontend
module.exports.ApiListaClientes = async (req, res) => {
    try {
        const resultado = await modelClientes.ObtenerClientesLista();
        const clientes = (resultado.clientes || []).map(function(c) {
            return {
                idCliente:  c.idcliente,
                nombre:     c.nombrerazonsocial || '',
                rfc:        c.rfc || '',
                tipoPersona: c.tipocliente || '',
                riesgo:     c.nivelriesgo || 'Bajo',
                esPep:      c.espep || false,
                docs:       c.estatusdocumentos || 'Pendiente'
            };
        });
        res.json({ clientes: clientes });
    } catch (error) {
        res.status(503).json({ msg: 'Error al obtener clientes', detalle: error.message });
    }
};

// Importar clientes desde un CSV
module.exports.ImportarCSV = async (req, res) => {
    try {
        if (!req.files || !req.files.csv) {
            return res.status(400).json({ exito: false, error: 'No se recibio el archivo CSV' });
        }

        const contenido = req.files.csv.data.toString('utf-8');
        const lineas    = contenido.split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });

        if (lineas.length < 2) {
            return res.status(400).json({ exito: false, error: 'El CSV esta vacio o no tiene datos' });
        }

        const encabezados = lineas[0].split(',');
        const clientes    = [];

        for (var i = 1; i < lineas.length; i++) {
            const valores  = lineas[i].split(',');
            const cliente  = {};
            encabezados.forEach(function(col, idx) {
                cliente[col.trim()] = (valores[idx] || '').trim();
            });
            clientes.push(cliente);
        }

        const resultado = await modelClientes.ImportarClientesDesdeCSV(clientes);

        if (resultado.exito) {
            modelHistorial.RegistrarAccion({ accion: 'Importar CSV clientes (' + resultado.insertados + ')', entidad: 'cliente', entidad_id: null, ip_origen: req.ip });
            res.json({ exito: true, insertados: resultado.insertados });
        } else {
            res.status(400).json({ exito: false, error: resultado.error });
        }
    } catch (error) {
        res.status(500).json({ exito: false, error: error.message });
    }
};


// Vista del expediente propio para el Cliente (busca por correo)
module.exports.MiExpediente = async (req, res) => {
    try {
        const correo = req.session.usuario && req.session.usuario.correo;
        if (!correo) return res.redirect('/login');

        const { data: clientes, error } = await supabase
            .from('cliente')
            .select('*')
            .eq('correoelectronico', correo)
            .limit(1);

        if (error || !clientes || clientes.length === 0) {
            return res.render('./clientes/detalle_cliente', {
                cliente:     null,
                documentos:  [],
                operaciones: [],
                contratos:   [],
                alertas:     [],
                sinExpediente: true
            });
        }

        const idCliente = clientes[0].idcliente;
        const [resDocs, resOps, resCons, resAlertas] = await Promise.all([
            modelClientes.ObtenerDocumentosCliente(idCliente),
            supabase.from('operacion').select('*').eq('idcliente', idCliente).order('idoperacion', { ascending: false }),
            supabase.from('contrato').select('*').eq('idcliente', idCliente).order('idcontrato', { ascending: false }),
            supabase.from('alerta').select('*').eq('idcliente', idCliente).order('idalerta', { ascending: false })
        ]);

        res.render('./clientes/detalle_cliente', {
            cliente:     clientes[0],
            documentos:  resDocs.documentos || [],
            operaciones: resOps.data || [],
            contratos:   resCons.data || [],
            alertas:     resAlertas.data || [],
            sinExpediente: false
        });
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Cambiar el estado de los documentos
module.exports.ValidarDocumento = async (req, res) => {
    try {
        const { idDocumento, estado } = req.body;
        
        if (!idDocumento || !estado) {
            return res.status(400).json({ exito: false, error: 'Faltan datos' });
        }

        if (!['Validado', 'Rechazado'].includes(estado)) {
            return res.status(400).json({ exito: false, error: 'Estado inválido' });
        }

        const resultado = await modelClientes.ActualizarEstadoDocumento(idDocumento, estado);
        
        if (resultado.exito) {
            modelHistorial.RegistrarAccion({ accion: 'Validar documento (' + estado + ')', entidad: 'documentocliente', entidad_id: idDocumento, ip_origen: req.ip });
            res.json({ exito: true, mensaje: `Documento ${estado.toLowerCase()}` });
        } else {
            res.status(400).json({ exito: false, error: resultado.error });
        }
    } catch (error) {
        res.status(500).json({ exito: false, error: error.message });
    }
};