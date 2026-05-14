// Modelo para historial de acciones y eventos del sistema

const supabase = require('../config/supabase');

// Obtener todo el historial
exports.ObtenerHistorial = async function() {
    try {
        const { data, error } = await supabase
            .from('historial')
            .select('*')
            .order('idlog', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, registros: data || [] };
    } catch (error) {
        return { exito: false, registros: [], error: error.message };
    }
};

// Obtener historial por usuario
exports.ObtenerHistorialPorUsuario = async function(idUsuario) {
    try {
        const { data, error } = await supabase
            .from('historial')
            .select('*')
            .eq('idusuario', idUsuario)
            .order('idlog', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, registros: data || [] };
    } catch (error) {
        return { exito: false, registros: [], error: error.message };
    }
};

// Historial por tipo de accion
exports.ObtenerHistorialPorAccion = async function(tipoAccion) {
    try {
        const { data, error } = await supabase
            .from('historial')
            .select('*')
            .eq('accion', tipoAccion)
            .order('idlog', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, registros: data || [] };
    } catch (error) {
        return { exito: false, registros: [], error: error.message };
    }
};

// Obtener detalle de un evento
exports.ObtenerEventoPorId = async function(idEvento) {
    try {
        const { data, error } = await supabase
            .from('historial')
            .select('*')
            .eq('idlog', idEvento)
            .single();

        if (error) throw new Error(error.message);
        return { exito: true, registro: data };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Registrar nueva accion en historial
exports.RegistrarAccion = async function(datosAccion) {
    try {
        await supabase.from('historial').insert([{
            idusuario:  datosAccion.idusuario  || null,
            accion:     datosAccion.accion,
            entidad:    datosAccion.entidad    || null,
            entidad_id: datosAccion.entidad_id || null,
            ip_origen:  datosAccion.ip_origen  || null,
            fecha:      new Date().toISOString()
        }]);
    } catch (err) {
        // El historial no debe detener el flujo principal
        console.error('Error al registrar historial:', err.message);
    }
};

// Filtrar historial por rango de fechas
exports.ObtenerHistorialPorFechas = async function(fechaInicio, fechaFin) {
    try {
        const { data, error } = await supabase
            .from('historial')
            .select('*')
            .gte('fecha', fechaInicio)
            .lte('fecha', fechaFin)
            .order('idlog', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, registros: data || [] };
    } catch (error) {
        return { exito: false, registros: [], error: error.message };
    }
};