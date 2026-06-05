// Modelos para controlar operaciones

const supabase = require('../config/supabase');

// Obtener todas las operaciones
exports.ObtenerOperaciones = async function() {
    try {
        const { data: operaciones, error } = await supabase
            .from('operacion')
            .select('*, cliente:idcliente(nombrerazonsocial), contrato:idcontrato(idcontrato, producto)')
            .order('idoperacion', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, operaciones: operaciones || [] };
    } catch (error) {
        return { exito: false, operaciones: [], error: error.message };
    }
};

// Agregar nueva operacion
exports.AgregarOperacion = async function(nuevaOperacion) {
    try {
        const { data, error } = await supabase
            .from('operacion')
            .insert([{
                idcliente:      nuevaOperacion.idcliente,
                idcontrato:     nuevaOperacion.idcontrato || null,
                producto:       nuevaOperacion.producto,
                tipooperacion:  nuevaOperacion.tipooperacion,
                monto:          parseFloat(nuevaOperacion.monto) || 0,
                moneda:         nuevaOperacion.moneda || 'MXN',
                fecha:          nuevaOperacion.fecha || new Date().toISOString().split('T')[0],
                estatus:        'Validacion'
            }])
            .select();

        if (error) throw new Error(error.message);
        return { exito: true, operacion: data[0] };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};
