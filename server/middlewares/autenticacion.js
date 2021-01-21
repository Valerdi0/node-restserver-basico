const jwt = require('jsonwebtoken');


//====================
// Verificar Token
//====================
const VerificaToken = (req, res, next) => {
    let token = req.get('Authorization');

    jwt.verify(token, process.env.SEED, function(err, decoded) {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
};


//====================
// Verificar AdminRole
//====================
const VerificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'Usuario no autorizado'
            }
        });
    }
};

//====================
// Verifica token para imagen
//====================
let VerificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, function(err, decoded) {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
}

module.exports = {
    VerificaToken,
    VerificaAdmin_Role,
    VerificaTokenImg
}