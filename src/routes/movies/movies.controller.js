const service = require("./movies.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

//list all movies. If the req has "is_showing" as param, it return only the movies that are currently showing
async function list(req, res, next) {
  let showing = req.query.is_showing;
  let data;

  showing
    ? (data = await service.listIsShowing())
    : (data = await service.list());

  res.json({ data: data });
}
//VALIDATION Middleware
async function movieExists(req, res, next) {
  const { movieId } = req.params;

  const movie = await service.read(movieId);
  if (movie) {
    res.locals.movie = movie;
    return next();
  }
  next({
    status: 404,
    message: "Movie cannot be found.",
  });
}

//Func to return a movie from the given movieId
function read(req, res, next) {
  res.json({ data: res.locals.movie });
}
//Func read to return all theaters where the movie from a guven movieId is being played
async function listTheaters(req, res, next) {
  const data = await service.listTheaters(res.locals.movie);
  res.json({ data: data });
}
//Func to return all reviews from the movie
async function listReviews(req, res, next) {
  const data = await service.listReviews(res.locals.movie);
  res.json({ data: data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(movieExists), read],
  listTheaters: [
    asyncErrorBoundary(movieExists),
    asyncErrorBoundary(listTheaters),
  ],
  listReviews: [
    asyncErrorBoundary(movieExists),
    asyncErrorBoundary(listReviews),
  ],
};
