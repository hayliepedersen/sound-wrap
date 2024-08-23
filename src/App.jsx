import { useEffect, useState } from 'react'
import './App.css'
import Home from './components/Home'
import Artists from './components/Artists'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
  const CLIENT_ID = "bf129aa3857d4267b7c4577497863ede"
  const REDIRECT_URI = "http://localhost:5173"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [profileUrl, setProfileUrl] = useState("")

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

  useEffect(() => {
    let accessToken = window.localStorage.getItem("token")

    const fetchUserProfile = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const profileImageUrl = data.images && data.images.length > 0
          ? data.images[0].url
          : null;

        setProfileUrl(profileImageUrl);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchUserProfile();
  }, []);

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
        {isAuthenticated &&
          <>
            <div className="icon-container">
              <img src={profileUrl} alt="User Icon" className="user-icon" />
            </div>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/artists" element={<Artists />} />
              </Routes>
            </Router>
          </>
        }
      </div>
    </>
  )
}

export default App;
