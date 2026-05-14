// Rutas para las alertas

const express           = require('express');
const router            = express.Router();
const controllerAlertas = require('../controllers/alertas.controller');

// Mostrar las alertas
router.get('/lista', controllerAlertas.ObtenerAlertas);

// API JSON para el frontend
router.get('/api/lista', controllerAlertas.ApiListaAlertas);
router.post('/api/resolver', controllerAlertas.ApiResolverAlerta);
router.post('/api/estatus', controllerAlertas.ApiCambiarEstatus);

// Detalle de alerta con historial del cliente
router.get('/detalle', controllerAlertas.VistaDetalleAlerta);
router.post('/resolver-detalle', controllerAlertas.ProcesarResolucion);

// mostrar el formulario para resolver las alertas
router.get('/resolver', controllerAlertas.VistaResolverAlerta);

// Guardar el resultado de la resolucion de una alerta
router.post('/resolver', controllerAlertas.ResolverAlerta);

module.exports = router;
