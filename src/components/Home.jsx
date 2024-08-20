import { useState, useEffect } from 'react';
import axios from 'axios'
import Artists from './Artists'

function Home() {
  const [playlists, setPlaylists] = useState([]);

  // Get all of the user's playlists
  const getPlaylists = async () => {
    const token = window.localStorage.getItem("token")
  
    try {
      const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPlaylists(data.items);

    } catch (error) {
      console.error("Error fetching playlists:", error)
    }
  };

  // Get a specific playlist from an array of playlist
  const getPlaylist = async (playlistId) => {
    const token = window.localStorage.getItem("token")
  
    try {
      const { data } = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log(data)
  
    } catch (error) {
      console.error("Error fetching playlist details:", error)
    }
  }

  // Get all tracks from a specific playlist
  const getPlaylistTracks = async (playlistId) => {
    const token = window.localStorage.getItem("token");
  
    try {
      const { data } = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log(data.items)

    } catch (error) {
      console.error("Error fetching playlist tracks");
    }
  };

  // Update the arrays of playlists
  useEffect(() => {
    if (playlists.length > 0) {
      const playlistId = playlists[0].id;
      getPlaylist(playlistId);
      getPlaylistTracks(playlistId);
    }
  }, [playlists]);
  
  return (
    <>
      <div className="Home">
        < Artists/>
        {/*Currently only returns playlists to console*/}
        <form onSubmit={getPlaylists} id="getPlaylists">
          <button type={"submit"}>Get Playlists</button>
        </form>
      </div>
    </>
  )
}

export default Home;