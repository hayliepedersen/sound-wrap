import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import linkArrow from '../assets/link-arrow.png';

function Home() {
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [inputGenre, setInputGenre] = useState("");
  const [genreMatches, setGenreMatches] = useState([]);

  // Get all of the user's playlists
  const getPlaylists = async (e) => {
    e.preventDefault()
    const token = window.localStorage.getItem("token")

    try {
      const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(data.items)
      setPlaylists(data.items)

    } catch (error) {
      console.error("Error fetching playlists:", error)
    }
  };

  // Gets all tracks from the playlist you are on
  const getPlaylistTracks = async (playlistId) => {
    const token = window.localStorage.getItem("token");

    try {
      const { data } = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(data.items)
      setTracks(data.items)

    } catch (error) {
      console.error("Error fetching playlist tracks");
    }
  };

  // Fetches the data for an artist, to be used for genre matching
  const getArtistDetails = async (artistId) => {
    const token = window.localStorage.getItem("token");

    try {
      const { data } = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      return data;

    } catch (error) {
      console.error("Error fetching artist details");
      return null;
    }
  };

  // For every playlist in playlists, gets the tracks using the playlist id
  const searchPlaylistsForTracks = async () => {
    let allTracks = {};

    for (const playlistKey in playlists) {
      const playlist = playlists[playlistKey];
      const playlistTracks = await getPlaylistTracks(playlist.id);

      allTracks = { ...allTracks, ...playlistTracks };
    }

    setTracks(allTracks);
  };

  const searchTracksForArtists = async (inputGenre) => {
    const genreMatches = [];

    for (const trackKey in tracks) {
      const track = tracks[trackKey];
      const artistId = track.track.artists[0].id;
      const artist = await getArtistDetails(artistId);
      console.log(artist)

      if (artist && artist.genres) {
        // Check if any genre matches the input genre
        if (artist.genres.some(genre => genre.toLowerCase().includes(inputGenre.toLowerCase()))) {
          genreMatches.push({
            playlist: tracks[trackKey].playlist.name,
            track: track.track.name,
            artist: artist.name,
            genres: artist.genres
          });
        }
      }
    }

    setGenreMatches(genreMatches);
  };

  // To be called when the input is submitted
  const handleSearch = async (e) => {
    await getPlaylists(e);
    searchTracksForArtists(e);
  };

  // Handles playlists
  useEffect(() => {
    if (playlists.length > 0) {
      setPlaylists(playlists)
      searchPlaylistsForTracks();
    }
  }, [playlists]);

  return (
    <>
      <div className="Home">
        <Link to={"./Artists"}>
          <img src={linkArrow} alt="Link Arrow" className="link-image" />
          Artist Reccomendation
        </Link >
        <h2>Genre Search</h2>
        <form onSubmit={(inputGenre) => handleSearch(inputGenre)}>
          <input
            type="text"
            value={inputGenre}
            onChange={(e) => setInputGenre(e.target.value)}
          />
          <br />
          <button type="submit" className='search'>Search</button>
        </form>
      </div>
    </>
  )
}

export default Home;