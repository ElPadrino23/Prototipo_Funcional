// Rutas de reportes internos de conductas sospechosas

const express   = require('express');
const router    = express.Router();
const controller = require('../controllers/reportes_internos.controller');

router.get('/lista',    controller.ListaReportesInternos);
router.get('/agregar',  controller.VistaAgregarRI);
router.post('/agregar', controller.AgregarRI);
router.post('/actualizar', controller.ActualizarRI);

module.exports = router;
