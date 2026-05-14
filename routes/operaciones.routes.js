// Rutas de operaciones

const express               = require('express');
const router                = express.Router();
const controllerOperaciones = require('../controllers/operaciones.controller');

// Mostrar las operaciones
router.get('/lista', controllerOperaciones.ObtenerOperaciones);

// API JSON para el frontend
router.get('/api/lista', controllerOperaciones.ApiListaOperaciones);

// formulario para registrar operaciones
router.get('/agregar', controllerOperaciones.VistaAgregarOperacion);

// Guardar nueva operacion (via JSON)
router.post('/api/agregar', controllerOperaciones.AgregarOperacion);
router.post('/agregar', controllerOperaciones.AgregarOperacion);

module.exports = router;
