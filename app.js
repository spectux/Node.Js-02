// app.js

const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()

const dbPath = path.join(__dirname, 'moviesData.db')
let db

app.use(express.json())

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3001, () => {
      console.log('Server Running at http://localhost:3001/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// API 1: Get all movie names
app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT 
      movie_name AS movieName
    FROM 
      movie;`
  const moviesArray = await db.all(getMoviesQuery)
  response.send(moviesArray)
})

// API 2: Create a new movie
app.post('/movies/', async (request, response) => {
  const {movieName, leadActor, directorId} = request.body
  const addMovieQuery = `
    INSERT INTO movie (movie_name, lead_actor, director_id)
    VALUES ('${movieName}', '${leadActor}', ${directorId});`
  await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

// API 3: Get a movie by ID
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT 
      movie_id AS movieId,
      movie_name AS movieName,
      lead_actor AS leadActor,
      director_id AS directorId
    FROM 
      movie
    WHERE 
      movie_id = ${movieId};`
  const movieDetails = await db.get(getMovieQuery)
  response.send(movieDetails)
})

// API 4: Update details of a movie by ID
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {movieName, leadActor, directorId} = request.body
  const updateMovieQuery = `
    UPDATE movie
    SET movie_name = '${movieName}', lead_actor = '${leadActor}', director_id = ${directorId}
    WHERE movie_id = ${movieId};`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

// API 5: Delete a movie by ID
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

// API 6: Get all directors
app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    SELECT 
      director_id AS directorId,
      director_name AS directorName
    FROM 
      director;`
  const directorsArray = await db.all(getDirectorsQuery)
  response.send(directorsArray)
})

// API 7: Get movies directed by a specific director
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMoviesByDirectorQuery = `
    SELECT 
      movie_name AS movieName
    FROM 
      movie
    WHERE 
      director_id = ${directorId};`
  const moviesByDirectorArray = await db.all(getMoviesByDirectorQuery)
  response.send(moviesByDirectorArray)
})

module.exports = app
