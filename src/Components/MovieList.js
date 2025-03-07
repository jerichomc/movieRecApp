import React, { useState, useEffect } from "react";
import axios from "axios";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Stores user input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

  // API URL for fetching popular movies or search results
  const API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${searchTerm}`;

  // Fetch popular movies when the component first loads
  useEffect(() => {
    fetchPopularMovies(); // Fetch popular movies on initial load
  }, []); 

  const fetchMovies = async () => {
    setLoading(true); 

    try {
      const url = searchTerm
        ? API_URL 
        : `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc`; 

      const response = await axios.get(url);
      const movieData = response.data.results;

      const movieDetails = await Promise.all(
        movieData.map(async (movie) => {
          const detailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${API_KEY}`;
          const detailsResponse = await axios.get(detailsUrl);
          const director = detailsResponse.data.crew.find((crew) => crew.job === "Director");
          const leadActor = detailsResponse.data.cast[0];
          return { ...movie, director, leadActor };
        })
      );
      setMovies(movieDetails);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch movies.");
      setLoading(false);
    }
  };

  const fetchPopularMovies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc`
      );
      const movieData = response.data.results;

      const movieDetails = await Promise.all(
        movieData.map(async (movie) => {
          const detailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${API_KEY}`;
          const detailsResponse = await axios.get(detailsUrl);
          const director = detailsResponse.data.crew.find((crew) => crew.job === "Director");
          const leadActor = detailsResponse.data.cast[0];
          return { ...movie, director, leadActor };
        })
      );
      setMovies(movieDetails);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch movies.");
      setLoading(false);
    }
  };

  const fetchRecommendations = async (movieId) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${API_KEY}&language=en-US`
      );
      const recommendedMovies = response.data.results;

      const movieDetails = await Promise.all(
        recommendedMovies.map(async (movie) => {
          const detailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${API_KEY}`;
          const detailsResponse = await axios.get(detailsUrl);
          const director = detailsResponse.data.crew.find((crew) => crew.job === "Director");
          const leadActor = detailsResponse.data.cast[0];
          return { ...movie, director, leadActor };
        })
      );

      setRecommendations(movieDetails);
    } catch (error) {
      setError("Failed to fetch recommended movies.");
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      fetchPopularMovies();
    } else {
      fetchMovies();
    }
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    fetchRecommendations(movie.id); // Fetch recommendations based on the selected movie
  };

  const handleBackToMovies = () => {
    setSelectedMovie(null);
    setRecommendations([]);
  };

  const handleHomeClick = () => {
    setSelectedMovie(null);
    setRecommendations([]);
    fetchPopularMovies(); // Go back to the popular movie page
  };

  if (loading) return <p>Loading movies...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="movie-list">
      <h1 id="title-box">Movie Recommendation App</h1>
      <h2>Click on a movie for recommendations</h2>

      
      <button onClick={handleHomeClick} id="home-button">Home</button>

      {/*show search bar only if no movie is selected*/}
      {!selectedMovie && (
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for a movie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      )}

      {/*If a movie is selected, show recommendations*/}
      {selectedMovie ? (
        <div className="recommendations">
          <h2 id="recommended-movie-box">Recommended Movies for "{selectedMovie.title}"</h2>
          {/* <button id="back-to-movies" onClick={handleBackToMovies}>Back to Movies</button> */}
          <div className="movie-container">
            {recommendations.map((movie) => (
              <div
                key={movie.id}
                className="movie-card"
                onClick={() => handleMovieClick(movie)} //Make recommended movies clickable
                style={{ cursor: "pointer" }}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="movie-image"
                />
                <h3>{movie.title}</h3>
                <p>{movie.release_date}</p>
                <p>Starring: <strong>{movie.leadActor ? movie.leadActor.name : "N/A"}</strong></p>
                <p>Director: <strong>{movie.director ? movie.director.name : "N/A"}</strong></p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Show main movie list only if no movie is selected
        <div className="movie-container">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="movie-card"
              onClick={() => handleMovieClick(movie)} //Make main movies clickable
              style={{ cursor: "pointer" }}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="movie-image"
              />
              <h3>{movie.title}</h3>
              <p>{movie.release_date}</p>
              <p>Starring: <strong>{movie.leadActor ? movie.leadActor.name : "N/A"}</strong></p>
              <p>Director: <strong>{movie.director ? movie.director.name : "N/A"}</strong></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieList;
