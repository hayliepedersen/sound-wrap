import { useState, useEffect } from 'react';
import axios from 'axios'
import Artists from './Artists'

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

  // Need to handle inputting a genre
  const searchPlaylistsForTracks = async (inputGenre) => {
    // For every playlist in playlists get the tracks using the playlist id
    for (const playlistKey in playlists) {
      const playlist = playlists[playlistKey];
      console.log(playlist.id);
      await getPlaylistTracks(playlist.id);
    }
  };

  const searchTracksForArtists = async () => {
    const genreMatches = [];

    // For every track in the pulled track objects
    for (const trackKey in tracks) {
      const track = tracks[trackKey];
      const artistId = track.track.artists[0].id;
      const artist = await getArtistDetails(artistId);
      console.log(artist)

      if (artist && artist.genres) {
        // Check if any genre matches the input genre
        if (artist.genres.some(genre => genre.toLowerCase().includes(inputGenre.toLowerCase()))) {
          genreMatches.push({
            playlist: playlist.name,
            track: track.track.name,
            artist: artist.name,
            genres: artist.genres
          });
        }
      }
    }
    console.log("Genre Matches:", genreMatches);
    setGenreMatches(genreMatches);
  }

  // Update the arrays of playlists 
  useEffect(() => {
    if (playlists.length > 0) {
      setPlaylists(playlists)
    }
  }, [playlists]);

  // Updates tracks
  useEffect(() => {
    if (tracks.length > 0) {
      setTracks(tracks)
    }
  }, [tracks]);

  return (
    <>
      <div className="Home">
        < Artists />

        {/*Currently only returns playlists to console*/}
        <form onSubmit={getPlaylists} id="getPlaylists">
          <button type={"submit"}>Get Playlists</button>
        </form>

        {/*This will run the function using the inputted text*/}
        <form onSubmit={() => searchPlaylistsForTracks(inputGenre)}>
          <input
            type="text"
            placeholder="Enter genre"
            value={inputGenre}
            onChange={(e) => setInputGenre(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>
    </>
  )
}

export default Home;