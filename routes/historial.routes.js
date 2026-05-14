// Acciones y eventos en el sistema

const express = require('express');
const router = express.Router();
const controllerHistorial = require('../controllers/historial.controller');

// historial de acciones
router.get('/lista', controllerHistorial.ObtenerHistorial);

// historial por usuario
router.get('/usuario', controllerHistorial.HistorialPorUsuario);

// filtrado por tipo de accion
router.get('/accion', controllerHistorial.HistorialPorAccion);

// detalles de evento
router.get('/detalle', controllerHistorial.DetalleEvento);

module.exports = router;