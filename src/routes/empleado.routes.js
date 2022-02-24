const express = require('express');
const empleadoController = require('../controllers/empleado.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/registrarEmpleado/:idEmpresa?', md_autenticacion.Auth, empleadoController.RegistrarEmpleado);
api.get('/misEmpleados/:idEmpresa?', md_autenticacion.Auth, empleadoController.MisEmpleados);
api.get('/empleadoPorId/:idEmpleado/:idEmpresa?', md_autenticacion.Auth, empleadoController.BuscarPorId);
api.get('/empleadoPorNombre/:nombreEmpleado/:idEmpresa?', md_autenticacion.Auth, empleadoController.BuscarPorNombre);
api.get('/empleadoPorPuesto/:puestoEmpleado/:idEmpresa?', md_autenticacion.Auth, empleadoController.BuscarPorPuesto);
api.get('/empleadoPorDepartamento/:departamentoEmpleado/:idEmpresa?', md_autenticacion.Auth, empleadoController.BuscarPorDepartamento);

module.exports = api;