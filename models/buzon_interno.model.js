const supabase = require('../config/supabase');

exports.ObtenerReportes = async function(idusuario) {
    try {
        let query = supabase.from('reporte_interno').select('*').order('id', { ascending: false });

        if (idusuario) query = query.eq('idusuario', idusuario);

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return { exito: true, reportes: data || [] };
    } catch (error) {
        return { exito: false, reportes: [], error: error.message };
    }
};

exports.CrearReporte = async function(datos, idusuario) {
    try {
        const { error } = await supabase.from('reporte_interno').insert([{
            descripcion: datos.descripcion,
            anonimo:     datos.anonimo === 'true' || datos.anonimo === true,
            estatus:     'Pendiente',
            responsable: null,
            fecha:       new Date().toISOString().split('T')[0],
            idusuario:   idusuario || null
        }]);

        if (error) throw new Error(error.message);
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

exports.ActualizarReporte = async function(id, datos) {
    try {
        const { error } = await supabase
            .from('reporte_interno')
            .update({ estatus: datos.estatus, responsable: datos.responsable || null })
            .eq('id', id);

        if (error) throw new Error(error.message);
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};
