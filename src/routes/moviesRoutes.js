const express = require('express');
const router = express.Router();
const {list,newest,recomended,detail,create,update,destroy} = require('../controllers/moviesController');

router
    .get('/movies', list)
    .get('/movies/new', newest)
    .get('/movies/recommended', recomended)
    .get('/movies/:id', detail)
    //Rutas exigidas para la creación del CRUD
    .post('/movies', create)
    .put('/movies/:id', update)
    .delete('/movies/:id', destroy)

module.exports = router;