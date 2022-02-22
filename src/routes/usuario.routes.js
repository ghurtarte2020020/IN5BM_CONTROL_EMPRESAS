const express = require('express');
const usuarioControlador = require('../controllers/usuario.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/login', usuarioControlador.Login);
api.post('/registrarEmpresa', md_autenticacion.Auth, usuarioControlador.RegistrarEmpresa);
api.put('/editarEmpresa/:idEmpresa?', md_autenticacion.Auth, usuarioControlador.EditarEmpresa);

module.exports = api;