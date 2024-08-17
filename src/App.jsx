import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const CLIENT_ID = "bf129aa3857d4267b7c4577497863ede"
  const REDIRECT_URI = "http://localhost:5173"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState("")
  const [searchKey, setSearchKey] = useState("")
  const [artists, setArtists] = useState([])

  useEffect(() => {
    const hash = window.location.hash
    let storedToken = window.localStorage.getItem("token")

    if (!token && hash) {
      storedToken = hash.substring(1).split("&").find(elem => elem.startsWith("access_token"))?.split("=")[1]

      window.location.hash = ""
      window.localStorage.setItem("token", storedToken)
    }

    setToken(storedToken)

  }, [])

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

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
    return artists.map(artist => (
        <div key={artist.id}>
            {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt=""/> : <div>No Image</div>}
            {artist.name}
        </div>
    ))
  }

  return (
    <>
     <div className="App">
        <header className="App-header">
          <h1>Sound Wrap</h1>
          {!token ?
            <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>
            : <button onClick={logout}>Logout</button>
          }
        </header>
        <form onSubmit={searchArtists}>
          <input type="text" onChange={e => setSearchKey(e.target.value)}/>
          <button type={"submit"}>Search</button>
        </form>
        <div>
          {renderArtists()}
        </div>
      </div>
    </>
  )
}

export default App
