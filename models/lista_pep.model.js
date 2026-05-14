// Modelo para validacion de clientes contra listas PEP

const supabase = require('../config/supabase');

// Verificar si un RFC o nombre coincide con la lista PEP interna
exports.VerificarPEP = async function(rfc, nombre) {
    try {
        const rfcUpper    = (rfc    || '').toUpperCase().trim();
        const nombreUpper = (nombre || '').toUpperCase().trim();

        // Buscar por RFC exacto
        const { data: porRFC } = await supabase
            .from('lista_pep')
            .select('*')
            .eq('rfc', rfcUpper)
            .limit(1);

        if (porRFC && porRFC.length > 0) {
            return { exito: true, esPEP: true, coincidencia: porRFC[0] };
        }

        // Buscar por nombre parcial
        const { data: porNombre } = await supabase
            .from('lista_pep')
            .select('*')
            .ilike('nombre', '%' + nombreUpper + '%')
            .limit(1);

        if (porNombre && porNombre.length > 0) {
            return { exito: true, esPEP: true, coincidencia: porNombre[0] };
        }

        return { exito: true, esPEP: false };
    } catch (error) {
        // Si la tabla no existe no bloqueamos el flujo
        return { exito: true, esPEP: false };
    }
};

exports.ObtenerListaPEP = async function() {
    try {
        const { data, error } = await supabase
            .from('lista_pep')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, lista: data || [] };
    } catch (error) {
        return { exito: false, lista: [], error: error.message };
    }
};

exports.AgregarEntradaPEP = async function(datos) {
    try {
        const { error } = await supabase.from('lista_pep').insert([{
            nombre:          (datos.nombre || '').toUpperCase(),
            rfc:             (datos.rfc    || '').toUpperCase(),
            tipo_lista:      datos.tipo_lista || 'PEP',
            fecha_inclusion: new Date().toISOString().split('T')[0]
        }]);

        if (error) throw new Error(error.message);
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

exports.EliminarEntradaPEP = async function(id) {
    try {
        const { error } = await supabase.from('lista_pep').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};
