// Modelo para clientes

const supabase   = require('../config/supabase');
const crypto     = require('crypto');
const modelPEP   = require('./lista_pep.model');


// Obtener lista de todos los clientes
module.exports.ObtenerClientesLista = async () => {
    try {
        const { data: clientes, error } = await supabase
            .from('cliente')
            .select('*')
            .order('idcliente', { ascending: false });

        if (error) throw new Error(`Error al obtener clientes: ${error.message}`);
        return { exito: true, clientes: clientes || [] };

    } catch (error) {
        return { exito: false, clientes: [], error: error.message };
    }
};


// Guardar cliente nuevo con sus documentos
module.exports.GuardarCliente = async (datosCliente, archivos) => {
    try {
        // Verificar contra lista PEP antes de guardar
        const checkPEP = await modelPEP.VerificarPEP(datosCliente.rfc, datosCliente.nombre);
        const esPEP    = datosCliente.esPEP === 'Sí' || checkPEP.esPEP;

        const { data: cliente, error: errorCliente } = await supabase
            .from('cliente')
            .insert([{
                nombrerazonsocial:          datosCliente.nombre,
                tipocliente:                datosCliente.tipoCliente,
                rfc:                        datosCliente.rfc,
                curp:                       datosCliente.curp || null,
                estatuscliente:             datosCliente.estatusCliente,
                nombrecontactoprincipal:    datosCliente.contactoPrincipal,
                telefono:                   datosCliente.telefono,
                correoelectronico:          datosCliente.correo,
                callenumero:                datosCliente.calle,
                colonia:                    datosCliente.colonia,
                ciudad:                     datosCliente.ciudad,
                estado:                     datosCliente.estado,
                codigopostal:               datosCliente.codigoPostal,
                nivelriesgo:                datosCliente.nivelRiesgo,
                espep:                      esPEP,
                limiteoperativoautorizado:  parseFloat(datosCliente.limiteOperativo) || 0,
                observaciones:              datosCliente.observaciones || null
            }])
            .select();

        if (errorCliente) throw new Error(`Error al guardar cliente: ${errorCliente.message}`);

        const idCliente = cliente[0].idcliente;

        // Guardar documentos si se subieron archivos
        if (archivos && Object.keys(archivos).length > 0) {
            for (const [tipoDoc, archivo] of Object.entries(archivos)) {
                if (archivo && archivo.size > 0) {
                    const hash = crypto.createHash('sha256').update(archivo.data).digest('hex');
                    await supabase.from('documentocliente').insert([{
                        idcliente:      idCliente,
                        tipodocumento:  tipoDoc,
                        nombrearchivo:  archivo.name,
                        rutaarchivo:    `/uploads/${tipoDoc}/${archivo.name}`,
                        hashdocumento:  hash
                    }]);
                }
            }
        }

        return { exito: true, idCliente: idCliente, mensaje: 'Cliente y documentos guardados correctamente' };

    } catch (error) {
        return { exito: false, error: error.message };
    }
};


// Obtener un cliente por su ID
module.exports.ObtenerClientePorId = async (idCliente) => {
    try {
        const { data, error } = await supabase
            .from('cliente')
            .select('*')
            .eq('idcliente', idCliente)
            .single();

        if (error) throw new Error(error.message);
        return { exito: true, cliente: data };

    } catch (error) {
        return { exito: false, error: error.message };
    }
};


// Editar cliente existente
module.exports.EditarCliente = async (idCliente, datosActualizados) => {
    try {
        const { error } = await supabase
            .from('cliente')
            .update(datosActualizados)
            .eq('idcliente', idCliente);

        if (error) throw new Error(error.message);
        return { exito: true };

    } catch (error) {
        return { exito: false, error: error.message };
    }
};


// Eliminar cliente
module.exports.EliminarCliente = async (idCliente) => {
    try {
        const { error } = await supabase
            .from('cliente')
            .delete()
            .eq('idcliente', idCliente);

        if (error) throw new Error(error.message);
        return { exito: true };

    } catch (error) {
        return { exito: false, error: error.message };
    }
};


// Obtener documentos de un cliente
module.exports.ObtenerDocumentosCliente = async (idCliente) => {
    try {
        const { data: documentos, error } = await supabase
            .from('documentocliente')
            .select('*')
            .eq('idcliente', idCliente)
            .order('iddocumentocliente', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, documentos: documentos || [] };

    } catch (error) {
        return { exito: false, documentos: [], error: error.message };
    }
};


// Actualizar estado de validacion de documento
module.exports.ActualizarEstadoDocumento = async (idDocumento, estadoValidacion) => {
    try {
        const { error } = await supabase
            .from('documentocliente')
            .update({ estadovalidacion: estadoValidacion })
            .eq('iddocumentocliente', idDocumento);

        if (error) throw new Error(error.message);
        return { exito: true };

    } catch (error) {
        return { exito: false, error: error.message };
    }
};