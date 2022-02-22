const express = require('express');
const cors = require('cors');
var app = express();

const UsuarioRutas = require('./src/routes/usuario.routes');
const EmpleadoRutas = require('./src/routes/empleado.routes');

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(cors());

app.use('/api', UsuarioRutas, EmpleadoRutas);
module.exports = app;