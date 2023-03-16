const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

app.use(express.json());

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbObjectToResponseObject1 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

let db = null;

const dbPath = path.join(__dirname, "moviesData.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Get All Movie Names API
app.get("/movies/", async (request, response) => {
  const getAllMovieNamesQuery = `
    SELECT 
    movie_name
    FROM movie;
    `;
  const movieNamesArray = await db.all(getAllMovieNamesQuery);
  response.send(
    movieNamesArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Post New Movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createMovieQuery = `
    INSERT INTO 
    movie (director_id, movie_name, lead_actor)
    VALUES (${directorId},'${movieName}', '${leadActor}');
    `;
  await db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

//Get a Movie details

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `
    SELECT * FROM movie
    WHERE movie_id = ${movieId}
    `;
  const movieMatter = await db.get(getMovieDetailsQuery);
  response.send(convertDbObjectToResponseObject(movieMatter));
});

//Put movie API

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE
      movie_id = ${movieId}
      `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete movie API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId}
    `;
  await db.get(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get Directors API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT 
    *
    FROM director
    `;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachPlayer) =>
      convertDbObjectToResponseObject1(eachPlayer)
    )
  );
});

//Get Movies Based On Director Id API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `
    SELECT 
    movie_name
    FROM movie WHERE director_id = ${directorId}
    `;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

module.exports = app;
