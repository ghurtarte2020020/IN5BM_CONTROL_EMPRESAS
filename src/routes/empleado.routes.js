const express = require('express');
const empleadoController = require('../controllers/empleado.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/registrarEmpleado/:idEmpresa?', md_autenticacion.Auth, empleadoController.RegistrarEmpleado);
api.get('/misEmpleados/:idEmpresa?', md_autenticacion.Auth, empleadoController.MisEmpleados);

module.exports = api;