const express = require('express');
let { VerificaToken, VerificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

//=============================
// Mostrar todas las categorias
//=============================
app.get('/categoria', VerificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            });
        })
});

//=============================
// Mostrar una categoria por ID
//=============================
app.get('/categoria/:id', VerificaToken, (req, res) => {
    let categoria = req.params.id;
    Categoria.findById(categoria, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//=============================
// Crear nueva categoria
//=============================
app.post('/categoria', VerificaToken, (req, res) => {

    let usuario = req.usuario._id;

    let categoria = new Categoria({
        descripcion: req.body.descripcion,
        usuario: usuario
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se pudo guardar la categoria'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//=============================
// Actualizar descripcion de categoria
//=============================
app.put('/categoria/:id', VerificaToken, (req, res) => {
    let categoria = req.params.id;
    let body = { descripcion: req.body.descripcion };

    Categoria.findByIdAndUpdate(categoria, body, { new: true, runValidators: true },
        (err, categoriaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se pudo actualizar la categoria'
                    }
                });
            }

            res.json({
                ok: true,
                categoria: categoriaDB
            });
        });
});

//=============================
// Mostrar todas las categorias
//=============================
app.delete('/categoria/:id', [VerificaToken, VerificaAdmin_Role], (req, res) => {
    let categoria = req.params.id;
    Categoria.findByIdAndRemove(categoria, (err, categoriaBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrado
        });
    });
});

module.exports = app;