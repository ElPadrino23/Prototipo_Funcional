// Modelo para alertas PLD

const supabase = require('../config/supabase');

// Obtener todas las alertas
exports.ObtenerAlertas = async function() {
    try {
        const { data: alertas, error } = await supabase
            .from('alerta')
            .select('*')
            .order('idalerta', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, alertas: alertas || [] };
    } catch (error) {
        return { exito: false, alertas: [], error: error.message };
    }
};

// Resolver una alerta cambiando su estatus
exports.ResolverAlerta = async function(idAlerta, datosResolucion) {
    try {
        const { error } = await supabase
            .from('alerta')
            .update({
                estatus:    'Resuelta',
                resolucion: datosResolucion.resolucion || ''
            })
            .eq('idalerta', idAlerta);

        if (error) throw new Error(error.message);
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Cambiar el estatus de una alerta (Pendiente → En revision → Resuelta)
exports.CambiarEstatus = async function(idAlerta, nuevoEstatus) {
    try {
        const { error } = await supabase
            .from('alerta')
            .update({ estatus: nuevoEstatus })
            .eq('idalerta', idAlerta);

        if (error) throw new Error(error.message);
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Obtener una alerta por ID
exports.ObtenerAlertaPorId = async function(idAlerta) {
    try {
        const { data, error } = await supabase
            .from('alerta')
            .select('*')
            .eq('idalerta', idAlerta)
            .single();

        if (error) throw new Error(error.message);
        return { exito: true, alerta: data };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Generar alertas evaluando las reglas activas configuradas
exports.GenerarAlertaSiAplica = async function(operacion) {
    const monto = parseFloat(operacion.monto) || 0;
    const hoy   = new Date().toISOString().split('T')[0];

    try {
        // Obtener reglas activas
        const { data: reglas } = await supabase.from('regla').select('*').eq('activa', true);

        for (const regla of (reglas || [])) {
            let dispara = false;
            let nivel   = 'Medio';

            if (regla.tipo === 'Individual' && regla.umbral_monto) {
                dispara = monto >= parseFloat(regla.umbral_monto);
                nivel   = monto >= 1500000 ? 'Alto' : 'Medio';

            } else if (regla.tipo === 'Acumulado' && regla.umbral_monto) {
                // Suma de operaciones del cliente en el mes actual
                const inicioMes = hoy.slice(0, 7) + '-01';
                const { data: ops } = await supabase
                    .from('operacion')
                    .select('monto')
                    .eq('idcliente', operacion.idcliente)
                    .gte('fecha', inicioMes);

                const acumulado = (ops || []).reduce(function(s, o) { return s + (parseFloat(o.monto) || 0); }, 0) + monto;
                dispara = acumulado >= parseFloat(regla.umbral_monto);
                nivel   = 'Medio';

            } else if (regla.tipo === 'Frecuencia' && regla.umbral_frecuencia) {
                // Conteo de operaciones del cliente en los ultimos 30 dias
                const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const { data: ops } = await supabase
                    .from('operacion')
                    .select('idoperacion')
                    .eq('idcliente', operacion.idcliente)
                    .gte('fecha', hace30);

                dispara = (ops || []).length + 1 >= parseInt(regla.umbral_frecuencia);
                nivel   = 'Medio';
            }

            if (dispara) {
                await supabase.from('alerta').insert([{
                    idoperacion: operacion.idoperacion,
                    idcliente:   operacion.idcliente,
                    nivel:       nivel,
                    estatus:     'Pendiente',
                    fecha:       hoy,
                    regla:       regla.nombre
                }]);
            }
        }

        // Regla base por defecto si no hay reglas configuradas
        if (!reglas || reglas.length === 0) {
            if (monto >= 600000) {
                await supabase.from('alerta').insert([{
                    idoperacion: operacion.idoperacion,
                    idcliente:   operacion.idcliente,
                    nivel:       monto >= 1500000 ? 'Alto' : 'Medio',
                    estatus:     'Pendiente',
                    fecha:       hoy,
                    regla:       'Umbral por defecto'
                }]);
            }
        }
    } catch (err) {
        console.error('Error al generar alerta:', err.message);
    }
};
