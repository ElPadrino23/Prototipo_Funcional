// autenticacion y login

const supabase = require('../config/supabase');

// Validar credenciales contra la tabla usuario en Supabase
exports.ValidarCredenciales = async function(correo, password) {
    try {
        const { data: usuarios, error } = await supabase
            .from('usuario')
            .select('*')
            .eq('correo', correo)
            .limit(1);

        if (error || !usuarios || usuarios.length === 0) {
            return null;
        }

        const usuario = usuarios[0];
        const campoPassword = usuario.password || usuario.contrasena || usuario.contrasena_hash;

        if (campoPassword !== password) {
            return null;
        }

        return {
            id:     usuario.idusuario || usuario.id_usuario || usuario.id,
            nombre: [usuario.nombre || '', usuario.apellido || ''].join(' ').trim(),
            correo: usuario.correo,
            rol:    usuario.rol || 'Usuario'
        };
    } catch (err) {
        throw new Error('Error al conectar con la base de datos: ' + err.message);
    }
};
