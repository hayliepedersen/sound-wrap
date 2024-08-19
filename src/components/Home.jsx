import { useState, useEffect } from 'react';
import axios from 'axios'

function Home() {
  const [searchKey, setSearchKey] = useState("")
  const [artists, setArtists] = useState([])
  const [isSubmitted, setIsSubmitted] = useState(false)

  const searchArtists = async (e) => {
    e.preventDefault()
    const token = window.localStorage.getItem("token")
    const {data} = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: searchKey,
        type: "artist"
      }
    })

    setArtists(data.artists.items)
  }

  const renderArtists = () => {
    return artists.slice(0, 8).map(artist => (
        <div key={artist.id}>
            {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt=""/> : <div>No Image</div>}
            {artist.name}
        </div>
    ))
  }

  const getUserPlaylists = async () => {
    const token = window.localStorage.getItem("token")
  
    try {
      const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      console.log(data.items);
      const playlistId = data.items[0].id;
      console.log("Playlist ID:", playlistId)
    } catch (error) {
      console.error("Error fetching playlists:", error)
    }
  };

  const getPlaylistDetails = async (playlistId) => {
    const token = window.localStorage.getItem("token")
  
    try {
      const { data } = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
  
      console.log(data); 
    } catch (error) {
      console.error("Error fetching playlist details:", error)
    }
  }

  const updateSubmit = () => {
    setIsSubmitted(true) 
  };

  const handleSubmit = (e) => {
    searchArtists(e)
    updateSubmit()
  }

    return (
        <>
         <div className="Home">
            <h2>Artist Reccomendation</h2>
            {!isSubmitted && <p>Enter your favorite artist:</p>}
            <form onSubmit={handleSubmit} id="searchArtists">
              <input type="text" onChange={e => setSearchKey(e.target.value)}/>
              <button type={"submit"}>Search</button>
            </form>
            {isSubmitted && <p>You may also like: </p>}
            <div className="artistImages">
              {renderArtists()}
            </div>
            {/*Currently only returns playlists to console*/}
            <form onSubmit={getUserPlaylists} id="getPlaylists">
              <button type={"submit"}>Get Playlists</button>
            </form>
          </div>
        </>
      )
}

export default Home;