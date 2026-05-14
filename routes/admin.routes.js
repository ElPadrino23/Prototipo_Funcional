// Rutas admin

const express        = require('express');
const router         = express.Router();
const controllerAdmin = require('../controllers/admin.controller');

// Vista lista de usuarios
router.get('/lista', controllerAdmin.ListaUsuarios);

// API JSON para el frontend
router.get('/api/lista', controllerAdmin.ApiListaUsuarios);

// Agregar usuario
router.get('/agregar', controllerAdmin.VistaAgregarUsuario);
router.post('/agregar', controllerAdmin.AgregarUsuario);

// Editar usuario
router.get('/editar', controllerAdmin.VistaEditarUsuario);
router.post('/editar', controllerAdmin.EditarUsuario);

// Eliminar usuario
router.post('/eliminar', controllerAdmin.EliminarUsuario);

// Lista PEP
router.get('/pep',           controllerAdmin.ListaPEP);
router.post('/pep/agregar',  controllerAdmin.AgregarPEP);
router.post('/pep/eliminar', controllerAdmin.EliminarPEP);

module.exports = router;
