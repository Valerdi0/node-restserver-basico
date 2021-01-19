const express = require('express');

const { VerificaToken } = require('../middlewares/autenticacion');


let app = express();
let Producto = require('../models/producto');
const categoria = require('../models/categoria');
const { version } = require('mongoose');


// ==================
// Obtener productos
// ==================
app.get('/productos', VerificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productos
            });
        });
});


// ==================
// Obtener un producto por ID
// ==================
app.get('/productos/:id', VerificaToken, (req, res) => {
    let producto = req.params.id;
    Producto.findById(producto)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID no es correcto'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

// ==================
// Buscar productos
// ==================
app.get('/productos/buscar/:termino', VerificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos: productos
            });
        });
});

// ==================
// Crear un nuevo producto
// ==================
app.post('/productos', VerificaToken, (req, res) => {
    let usuario = req.usuario._id;
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        disponible: body.disponible,
        usuario: usuario
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se pudo guardar el producto'
                }
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });

});

// ==================
// Actualizar un nuevo producto
// ==================
app.put('/productos/:id', VerificaToken, (req, res) => {
    let producto = req.params.id;
    let body = {
        nombre: req.body.nombre,
        precioUni: req.body.precioUni,
        categoria: req.body.categoria
    };

    if (req.body.descripcion != undefined) {
        body.descripcion = req.body.descripcion;
    }

    Producto.findByIdAndUpdate(producto, body, { new: true, runValidators: true },
        (err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se pudo actualizar el producto'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });

});

// ==================
// Borrar un producto
// ==================
app.delete('/productos/:id', VerificaToken, (req, res) => {
    // solo cambar el atributo disponible
    let id = req.params.id;
    let cambiaDisponible = { disponible: false };
    Producto.findByIdAndUpdate(id, cambiaDisponible, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado
        });
    });
});

module.exports = app;