const jwt_simple = require('jwt-simple');
const moment = require('moment');
const secret = 'clave_secreta_IN6BM2';

exports.crearToken = function (usuario) {
    let payload = {
        sub: usuario._id,
        nombreEmpresa: usuario.nombreEmpresa,
        usuario: usuario.usuario,
        rol: usuario.rol,
        iat: moment().unix(),
        exp: moment().day(7, 'days').unix()
    }

    return jwt_simple.encode(payload, secret);
}