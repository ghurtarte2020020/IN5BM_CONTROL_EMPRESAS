const Usuario = require('../models/usuario.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');



function UsuarioInicial(){
    Usuario.find({rol: 'Admin', usuario: 'Admin'}, (err, usuarioEcontrado) => {
        if(usuarioEcontrado.length ==0){
            bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {
                Usuario.create({
                    nombreEmpresa: null,
                    usuario: 'Admin',
                    password: passwordEncriptada,
                    rol: 'Admin'
                })
            });
        }
    })
}


function Login(req, res) {
    var parametros = req.body;
    Usuario.findOne({ usuario : parametros.usuario }, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(usuarioEncontrado){
            // COMPARO CONTRASENA SIN ENCRIPTAR CON LA ENCRIPTADA
            bcrypt.compare(parametros.password, usuarioEncontrado.password, 
                (err, verificacionPassword)=>{//TRUE OR FALSE
                    // VERIFICO SI EL PASSWORD COINCIDE EN BASE DE DATOS
                    if ( verificacionPassword ) {
                        // SI EL PARAMETRO OBTENERTOKEN ES TRUE, CREA EL TOKEN
                        if(parametros.obtenerToken === 'true'){
                            return res.status(200)
                                .send({ token: jwt.crearToken(usuarioEncontrado) })
                        } else {
                            if(usuarioEncontrado.nombreEmpresa==null){
                                usuarioEncontrado.nombreEmpresa= undefined;
                            }
                            usuarioEncontrado.password = undefined;
                            return  res.status(200)
                                .send({ usuario: usuarioEncontrado })
                        }

                        
                    } else {
                        return res.status(500)
                            .send({ mensaje: 'Las contrasena no coincide'});
                    }
                })

        } else {
            return res.status(500)
                .send({ mensaje: 'Error, el usuario no se encuentra registrado.'})
        }
    })
}

function RegistrarEmpresa(req, res) {
    var parametros = req.body;
    var usuarioModel = new Usuario();

    if(req.user.rol != 'Admin'){
        return res.status(500).send({ mensaje: 'Usted no tiene autorización para ejecutar esta acción'})
    }

    if(parametros.nombreEmpresa && parametros.usuario && parametros.password) {
            usuarioModel.nombreEmpresa = parametros.nombreEmpresa;
            usuarioModel.usuario = parametros.usuario;
            usuarioModel.rol = 'Empresa';

            Usuario.find({ usuario : parametros.usuario }, (err, usuarioEncontrado) => {
                if ( usuarioEncontrado.length == 0 ) {

                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModel.password = passwordEncriptada;

                        usuarioModel.save((err, usuarioGuardado) => {
                            if (err) return res.status(500)
                                .send({ mensaje: 'Error en la peticion' });
                            if(!usuarioGuardado) return res.status(500)
                                .send({ mensaje: 'Error al agregar el Usuario'});
                            
                            return res.status(200).send({ usuario: usuarioGuardado });
                        });
                    });                    
                } else {
                    return res.status(500)
                        .send({ mensaje: 'Este usuario, ya  se encuentra registrado' });
                }
            })
    }else{
        return res.status(500).send({mensaje: "Debe rellenar los campos necesarios"})
    }
}


function EditarEmpresa(req, res) {
    var parametros = req.body;    

    if(req.user.rol == 'Empresa'){
        idEmpresa = req.user.sub
    }else if(req.user.rol == 'Admin'){

        if(req.params.idEmpresa==null){
            return res.status(500)
                    .send({ mensaje: 'debe enviar el id de la empresa' });
        }
        
        var idEmpresa = req.params.idEmpresa;
    }

    if(parametros.rol){
        return res.status(500)
        .send({ mensaje: 'Error, no puede modificar el rol de la empresa.'})
    }

    Usuario.findByIdAndUpdate(idEmpresa, parametros, {new : true},
        (err, usuarioActualizado)=>{
            if(err) return res.status(500)
                .send({ mensaje: 'Error en la peticion' });
            if(!usuarioActualizado) return res.status(500)
                .send({ mensaje: 'Error al editar el Usuario'});
            return res.status(200).send({usuario : usuarioActualizado})
        })
}

module.exports = {
    UsuarioInicial,
    Login,
    RegistrarEmpresa,
    EditarEmpresa
}