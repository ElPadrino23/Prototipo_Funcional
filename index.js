// index

const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');
const fileUpload = require('express-fileupload');
const session    = require('express-session');
const auth             = require('./middleware/auth');
const { verificarRol } = auth;
const app = express();

const modelClientes    = require('./models/clientes.model');
const modelOperaciones = require('./models/operaciones.model');
const modelAlertas     = require('./models/alertas.model');

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

// Expone el usuario de sesión a todas las vistas
app.use((req, res, next) => {
    res.locals.usuario = req.session ? req.session.usuario : null;
    next();
});

// Middleware para archivos
app.use(fileUpload());

// Middleware para parsear datos
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Archivos públicos
app.use(express.static(path.join(__dirname, 'public')));

// Marca la ruta activa para resaltarla en la navegacion
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

// Estado del servidor
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Rutas protegidas por rol

const OFICIAL  = 'Oficial de Cumplimiento';
const ANALISTA = 'Analista';

const rutasClientes = require('./routes/clientes.routes');
app.use('/clientes', auth, verificarRol(OFICIAL, ANALISTA), rutasClientes);

const rutasOperaciones = require('./routes/operaciones.routes');
app.use('/operaciones', auth, verificarRol(OFICIAL, ANALISTA), rutasOperaciones);

const rutasAlertas = require('./routes/alertas.routes');
app.use('/alertas', auth, verificarRol(OFICIAL, ANALISTA), rutasAlertas);

const rutasContratos = require('./routes/contratos.routes');
app.use('/contratos', auth, verificarRol(OFICIAL, ANALISTA), rutasContratos);

const rutasReportes = require('./routes/reportes.routes');
app.use('/reportes', auth, verificarRol(OFICIAL), rutasReportes);

const rutasAdmin = require('./routes/admin.routes');
app.use('/admin', auth, verificarRol(OFICIAL), rutasAdmin);

const rutasReglas = require('./routes/reglas.routes');
app.use('/reglas', auth, verificarRol(OFICIAL), rutasReglas);

const rutasHistorial = require('./routes/historial.routes');
app.use('/historial', auth, verificarRol(OFICIAL), rutasHistorial);

const rutasBuzonInterno  = require('./routes/buzon_interno.routes');
app.use('/buzon-interno', auth, rutasBuzonInterno);

const controllerClientes = require('./controllers/clientes.controller');
app.get('/mi-expediente', auth, controllerClientes.MiExpediente);

// Login 

const rutasLogin = require('./routes/login.routes');
app.use('/login', rutasLogin);

app.get('/', (req, res) => res.redirect('/login'));

// Dashboard 

app.get('/dashboard', auth, verificarRol(OFICIAL, ANALISTA), (req, res) => {
    res.render('dashboard', { mensaje: req.query.mensaje || null });
});

app.get('/api/dashboard', auth, verificarRol(OFICIAL, ANALISTA), async (req, res) => {
    try {
        const resultadoClientes    = await modelClientes.ObtenerClientesLista();
        const resultadoOperaciones = await modelOperaciones.ObtenerOperaciones();
        const resultadoAlertas     = await modelAlertas.ObtenerAlertas();

        const clientes    = resultadoClientes.clientes || [];
        const operaciones = resultadoOperaciones.operaciones || [];
        const alertas     = resultadoAlertas.alertas || [];

        const alertasRecientes = alertas.slice(0, 5).map(function(a) {
            return {
                descripcion: a.regla || ('Operación #' + (a.idoperacion || '')),
                nivel:       a.nivel || '',
                estatus:     a.estatus || '',
                fecha:       a.fecha || ''
            };
        });

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

// Manejador de errores

app.use((error, req, res, next) => {
    console.error(error.message);
    if (req.path.includes('/api/')) {
        res.status(503).json({ msg: 'No fue posible consultar la base de datos', detalle: error.message });
        return;
    }
    next(error);
});

// Servidor

const server = app.listen(3000, () => {
    console.log('-> http://localhost:3000');
});

process.on('SIGINT', () => {
    server.close(() => process.exit(0));
});
