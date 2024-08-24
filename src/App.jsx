import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'
import Home from './components/Home'
import Artists from './components/Artists'
import User from './components/User' 

function App() {
  const CLIENT_ID = "bf129aa3857d4267b7c4577497863ede"
  const REDIRECT_URI = "http://localhost:5173"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    let storedToken = window.localStorage.getItem("token")

    if (!token && hash) {
      storedToken = hash.substring(1).split("&").find(elem => elem.startsWith("access_token"))?.split("=")[1]

      window.location.hash = ""
      window.localStorage.setItem("token", storedToken)
    }

    setToken(storedToken)
    setIsAuthenticated(true)

  }, [])

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token")

    setIsAuthenticated(false)
  }

  return (
    <>
      <div className="App">
        <header className="App-header">
          <h1>Sound Wrap</h1>
          {!token ?
            <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`} className="login">Login to Spotify</a>
            : <button onClick={logout}>Logout</button>
          }
        </header>
      </div>
      {isAuthenticated &&
        <>
          {<User />}
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/artists" element={<Artists />} />
            </Routes>
          </Router>
        </>
      }
    </>
  )
}

export default App;
