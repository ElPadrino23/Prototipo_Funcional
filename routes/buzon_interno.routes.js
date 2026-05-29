const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/buzon_interno.controller');

router.get('/lista',       controller.Lista);
router.get('/agregar',     controller.VistaAgregar);
router.post('/agregar',    controller.Agregar);
router.post('/actualizar', controller.Actualizar);

module.exports = router;
