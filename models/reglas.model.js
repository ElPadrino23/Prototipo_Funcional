// reglas y umbrales PLD

const supabase = require('../config/supabase');

// Obtener todas las reglas
exports.ObtenerReglas = async function() {
    try {
        const { data: reglas, error } = await supabase
            .from('regla')
            .select('*')
            .order('idregla', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, reglas: reglas || [] };
    } catch (error) {
        return { exito: false, reglas: [], error: error.message };
    }
};

// Obtener regla por ID
exports.ObtenerReglaPorId = async function(idRegla) {
    try {
        const { data, error } = await supabase
            .from('regla')
            .select('*')
            .eq('idregla', idRegla)
            .single();

        if (error) throw new Error(error.message);
        return { exito: true, regla: data };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Crear nueva regla
exports.CrearRegla = async function(datosRegla) {
    try {
        const { error } = await supabase
            .from('regla')
            .insert([{
                nombre:              datosRegla.nombre,
                tipo:                datosRegla.tipo,
                umbral_monto:        datosRegla.umbral_monto    ? parseFloat(datosRegla.umbral_monto)    : null,
                umbral_frecuencia:   datosRegla.umbral_frecuencia ? parseInt(datosRegla.umbral_frecuencia) : null,
                activa:              true
            }]);

        if (error) throw new Error(error.message);
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Actualizar regla existente
exports.ActualizarRegla = async function(idRegla, datosActualizados) {
    try {
        const { error } = await supabase
            .from('regla')
            .update({
                nombre:            datosActualizados.nombre,
                tipo:              datosActualizados.tipo,
                umbral_monto:      datosActualizados.umbral_monto      ? parseFloat(datosActualizados.umbral_monto)      : null,
                umbral_frecuencia: datosActualizados.umbral_frecuencia ? parseInt(datosActualizados.umbral_frecuencia)   : null,
                activa:            datosActualizados.activa === 'true' || datosActualizados.activa === true
            })
            .eq('idregla', idRegla);

        if (error) throw new Error(error.message);
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Eliminar regla
exports.EliminarRegla = async function(idRegla) {
    try {
        const { error } = await supabase
            .from('regla')
            .delete()
            .eq('idregla', idRegla);

        if (error) throw new Error(error.message);
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Validar regla antes de guardar
exports.ValidarRegla = function(datosRegla) {
    if (!datosRegla.nombre || !datosRegla.tipo) {
        return { valida: false, error: 'Nombre y tipo son obligatorios' };
    }
    const tiposValidos = ['Acumulado', 'Frecuencia', 'Individual'];
    if (!tiposValidos.includes(datosRegla.tipo)) {
        return { valida: false, error: 'Tipo de regla no valido' };
    }
    return { valida: true };
};