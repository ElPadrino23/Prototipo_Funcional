// index

//Librerias no tocar
const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');
const fileUpload = require('express-fileupload');
const session    = require('express-session');
const auth       = require('./middleware/auth');
const app = express();

const modelClientes    = require('./models/clientes.model');
const modelOperaciones = require('./models/operaciones.model');
const modelAlertas     = require('./models/alertas.model');

// Credenciales de acceso rapido para pruebas
const usuarioDemo = {
    correo: 'demo@sofom.mx',
    password: 'demo123'
};

// Notificar el uso de ejs
app.set('view engine', 'ejs');
app.set('views', 'views');

// Sesiones
app.use(session({
    secret:            'pld-sofom-secret-2024',
    resave:            false,
    saveUninitialized: false,
    cookie:            { maxAge: 8 * 60 * 60 * 1000 }
}));

// Middleware para archivos
app.use(fileUpload());

// Middleware para parsear datos
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// jala los archivos que esten publicos
app.use(express.static(path.join(__dirname, 'public')));

// Marca la ruta activa para resaltarla en la navegacion
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

//Conocer el estado del servidor
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// rutas a clientes
const rutasClientes = require('./routes/clientes.routes');
app.use('/clientes', auth, rutasClientes);

// rutas a operaciones
const rutasOperaciones = require('./routes/operaciones.routes');
app.use('/operaciones', auth, rutasOperaciones);

// rutas a alertas
const rutasAlertas = require('./routes/alertas.routes');
app.use('/alertas', auth, rutasAlertas);

// Rutas de contratos
const rutasContratos = require('./routes/contratos.routes');
app.use('/contratos', auth, rutasContratos);

// Rutas de reportes
const rutasReportes = require('./routes/reportes.routes');
app.use('/reportes', auth, rutasReportes);

// Rutas de admin
const rutasAdmin = require('./routes/admin.routes');
app.use('/admin', auth, rutasAdmin);

// Rutas de reglas
const rutasReglas = require('./routes/reglas.routes');
app.use('/reglas', auth, rutasReglas);

// Rutas de historial
const rutasHistorial = require('./routes/historial.routes');
app.use('/historial', auth, rutasHistorial);

// Rutas de buzón interno
const rutasBuzonInterno = require('./routes/buzon_interno.routes');
app.use('/buzon-interno', auth, rutasBuzonInterno);

// Rutas de login
const rutasLogin = require('./routes/login.routes');
app.use('/login', rutasLogin);

// Ruta raiz redirige al login
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Dashboard principal despues del inicio de sesion
app.get('/dashboard', auth, (req, res) => {
    res.render('dashboard');
});

// API para los contadores del dashboard
app.get('/api/dashboard', auth, async (req, res) => {
    try {
        const resultadoClientes    = await modelClientes.ObtenerClientesLista();
        const resultadoOperaciones = await modelOperaciones.ObtenerOperaciones();
        const resultadoAlertas     = await modelAlertas.ObtenerAlertas();

        const clientes    = resultadoClientes.clientes || [];
        const operaciones = resultadoOperaciones.operaciones || [];
        const alertas     = resultadoAlertas.alertas || [];

        // Ultimas 5 alertas para el dashboard
        const alertasRecientes = alertas.slice(0, 5).map(function(a) {
            return {
                descripcion: a.regla || ('Operacion #' + (a.idoperacion || '')),
                nivel:       a.nivel || '',
                estatus:     a.estatus || '',
                fecha:       a.fecha || ''
            };
        });

        // Distribucion de clientes por nivel de riesgo
        const distribucionRiesgo = ['Bajo', 'Medio', 'Alto'].map(function(nivel) {
            return {
                nivel:    nivel,
                cantidad: clientes.filter(function(c) { return c.nivelriesgo === nivel; }).length
            };
        });

        res.json({
            totalClientes:          clientes.length,
            totalOperaciones:       operaciones.length,
            totalAlertasPendientes: alertas.filter(function(a) { return a.estatus !== 'Resuelta'; }).length,
            totalReportesListos:    0,
            alertasRecientes:       alertasRecientes,
            distribucionRiesgo:     distribucionRiesgo
        });
    } catch (error) {
        res.json({
            totalClientes: 0, totalOperaciones: 0,
            totalAlertasPendientes: 0, totalReportesListos: 0,
            alertasRecientes: [], distribucionRiesgo: []
        });
    }
});

// Manejador de errores global
app.use((error, req, res, next) => {
    console.error(error.message);

    if (req.path.includes('/api/')) {
        res.status(503).json({
            msg: 'No fue posible consultar la base de datos',
            detalle: error.message
        });
        return;
    }

    next(error);
});

// inicia el servidor en el host 3000
const server = app.listen(3000, () => {
    console.log('-> http://localhost:3000');
});

// cerrar el servidor correctamente cuando se use Ctrl + C
process.on('SIGINT', () => {
    server.close(() => {
        process.exit(0);
    });
});
