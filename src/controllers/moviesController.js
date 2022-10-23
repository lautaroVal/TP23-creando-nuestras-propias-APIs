const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");

//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;

const moviesController = {
    'list': async (req, res) => {
            try {
                let movies = await db.Movie.findAll({
                    include: [
                        {
                            association: "genre",
                            attributes: ['id','name']
                        }
                    ]
                })

                if(movies.length)
                return res.status(200).json({
                    ok: true,
                    meta : {
                        total: movies.length
                    },
                    data: movies
                })

                throw new Error ('Upps, hubo un error');

            } catch (error) {
                console.log(error);
                return res.status(500).json({
                    ok: false,
                    msg: error.message ? error.message : 'Comuníquese con el administrador del sitio'
                })
            }
    },
    'detail': async (req, res) => {
        let error;
            try {
                const {id} = req.params;
                if(isNaN(id)){
                    error = new Error('El ID debe ser un número');
                    error.status = 401;
                    throw error;
                }

                let movie = await db.Movie.findByPk(req.params.id, {
                    include: [{
                        all : true                                       // Trae todos los atributes de todas las asociaciones
                    }]
                });

                if(movie)
                return res.status(200).json({
                    ok: true,
                    meta : {
                        total: 1
                    },
                    data: movie
                });

                error = new Error('Upps, la pelicula no existe');
                error.status = 403;

                throw error;
                
            } catch (error) {
                console.log(error);
                return res.status(error.status || 500).json({
                    ok: false,
                    msg: error.message ? error.message : 'Comuniquese con el administrador del sitio'
                })
            }
    },
    'newest': async (req, res) => {
        let error;
            try {
                let newMovies = await db.Movie.findAll({
                    order: [
                        ['release_date','DESC']
                    ],
                    limit: +req.query.limit || 5
                })

                if (newMovies.length) {
                    return res.status(200).json({
                        ok: true,
                        meta : {
                            total: newMovies.length
                        },
                        data: newMovies
                    });
                }

                error = new Error('Upps, no hay peliculas');
                error.status = 403;
                throw error;

            } catch (error) {
                console.log(error);
                return res.status(error.status || 500).json({
                    ok: false,
                    msg: error.message ? error.message : 'Comuniquese con el administrador del sitio'
                })
            }

    },
    'recomended': async (req, res) => {
        let error;
        try {
            const recomended = await db.Movie.findAll({
                include: ['genre'],
                limit: +req.query.limit || 5,
                order: [
                    ['rating', 'DESC']
                ]
            })
            
            if (recomended.length) {
                return res.status(200).json({
                    ok: true,
                    meta : {
                        total: recomended.length
                    },
                    data: recomended
                });
            }
            error = new Error('Upps, no hay peliculas');
                error.status = 403;
                throw error;
            
        } catch (error) {
            console.log(error);
                return res.status(error.status || 500).json({
                    ok: false,
                    msg: error.message ? error.message : 'Comuniquese con el administrador del sitio'
                })
        }

    },

    //Aqui dispongo las rutas para trabajar con el CRUD
    create: async (req,res) => {
        const {title,rating,awards,release_date,length,genre_id} = req.body;
        try {
            let newMovie = await db.Movie.create(
                {
                    title: title,
                    rating: rating,
                    awards: awards,
                    release_date: release_date,
                    length: length,
                    genre_id: genre_id
                })

                if (newMovie) {
                    return res.status(200).json({
                        ok: true,
                        meta : {
                            total: 1,
                            url: `${req.protocol}://${req.get('host')}/movies/${newMovie.id}`  // Mandamos url dinámico 
                        },
                        data: newMovie
                    });
                }

        } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message ? error.message : 'Comuniquese con el administrador del sitio'
            })
        }

    },
    update: async (req,res) => {
        try {
            let movieId = req.params.id;
            const movie = await db.Movie.update(
                {
                    title: req.body.title,
                    rating: req.body.rating,
                    awards: req.body.awards,
                    release_date: req.body.release_date,
                    length: req.body.length,
                    genre_id: req.body.genre_id
                },
                {
                    where: {id: movieId}
                })
            if (movie) {
                return res.status(200).json({
                    ok:true,
                    meta: {
                        total: 1
                    },
                    data: movie
                })
            }      

            } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message ? error.message : 'Comuníquese con el administrador del sitio'
            })
        }
        
    },
    destroy: async (req,res) => {
        try {
            let movieId = req.params.id;
            const movie = db.Movie.destroy({
                where: {id: movieId}, 
                force: true          // force: true es para asegurar que se ejecute la acción
            }) 
            if (movie) {
                return res.status(200).json({
                    ok:true,
                    meta: {
                        total: 1
                    },
                    data: movie
                })
            }
            
        } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message ? error.message : 'Comuníquese con el administrador del sitio'
            })
        }
    }
}

module.exports = moviesController;

/* Error.prototype.setCodeError = function(msg,code) {
    return {
      message:msg,
      status:code,
    }
  }
  
  let a = 2
  try {
    if(a === 2){
      throw new Error().setCodeError("mensaje",300)
    }
  } catch (error) {
    console.log(error);
  }
   */

