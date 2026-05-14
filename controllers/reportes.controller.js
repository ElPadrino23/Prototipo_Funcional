// Controlador de reportes

const supabase = require('../config/supabase');

// Vista lista de reportes
module.exports.LoginReportes = async (req, res) => {
    res.render('./reportes/lista_reportes', {
        mensaje: req.query.mensaje || null
    });
};

// API: devuelve reportes como JSON para el frontend
module.exports.ApiListaReportes = async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('reporte')
            .select('*')
            .order('idreporte', { ascending: false });

        if (error) throw new Error(error.message);

        const reportes = (rows || []).map(function(r) {
            return {
                idReporte: r.idreporte,
                clave:     r.clave || '',
                nombre:    r.nombre || '',
                periodo:   r.periodo || '',
                registros: r.registros || 0,
                estatus:   r.estatus || '',
                formato:   r.formato || ''
            };
        });

        res.json({ reportes: reportes });
    } catch (error) {
        // Tabla no creada aun - devolver vacio sin romper el frontend
        res.json({ reportes: [], nota: 'Tabla reporte pendiente en Supabase' });
    }
};

// Generar reporte de operaciones del periodo como TXT o XML
module.exports.GenerarReporte = async (req, res) => {
    try {
        const periodo  = req.body.periodo  || new Date().toISOString().slice(0, 7);
        const formato  = req.body.formato  || 'TXT';
        const inicioMes = periodo + '-01';
        const finMes    = periodo + '-31';

        const { data: operaciones, error } = await supabase
            .from('operacion')
            .select('*')
            .gte('fecha', inicioMes)
            .lte('fecha', finMes)
            .order('idoperacion');

        if (error) throw new Error(error.message);

        const ops      = operaciones || [];
        const clave    = 'RPT-' + periodo.replace('-', '');
        let   contenido = '';

        if (formato === 'XML') {
            const filas = ops.map(function(o) {
                return `  <operacion>
    <id>${o.idoperacion}</id>
    <cliente>${o.idcliente}</cliente>
    <producto>${o.producto || ''}</producto>
    <tipo>${o.tipooperacion || ''}</tipo>
    <monto>${o.monto || 0}</monto>
    <moneda>${o.moneda || 'MXN'}</moneda>
    <fecha>${o.fecha || ''}</fecha>
  </operacion>`;
            }).join('\n');
            contenido = `<?xml version="1.0" encoding="UTF-8"?>\n<reporte>\n  <clave>${clave}</clave>\n  <periodo>${periodo}</periodo>\n  <registros>${ops.length}</registros>\n  <operaciones>\n${filas}\n  </operaciones>\n</reporte>`;
        } else {
            const header = 'ID|CLIENTE|PRODUCTO|TIPO|MONTO|MONEDA|FECHA';
            const filas  = ops.map(function(o) {
                return [o.idoperacion, o.idcliente, o.producto || '', o.tipooperacion || '', o.monto || 0, o.moneda || 'MXN', o.fecha || ''].join('|');
            });
            contenido = [header, ...filas].join('\n');
        }

        // Guardar metadata en la tabla reporte
        await supabase.from('reporte').insert([{
            clave:     clave,
            nombre:    'Reporte de operaciones ' + periodo,
            periodo:   periodo,
            registros: ops.length,
            estatus:   'Listo',
            formato:   formato
        }]);

        const ext      = formato === 'XML' ? 'xml' : 'txt';
        const mime     = formato === 'XML' ? 'application/xml' : 'text/plain';
        res.setHeader('Content-Disposition', `attachment; filename="${clave}.${ext}"`);
        res.setHeader('Content-Type', mime);
        res.send(contenido);

    } catch (error) {
        res.redirect('/reportes/lista?mensaje=' + encodeURIComponent('Error al generar: ' + error.message));
    }
};

module.exports.ListaReportes = async (req, res) => {
    res.redirect('/reportes/lista');
};
