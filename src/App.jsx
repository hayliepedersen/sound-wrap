import { useEffect, useState, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios'
import './App.css'
import Home from './components/Home'
import Artists from './components/Artists'
import logoutArrow from './assets/logout.png';
import menu from './assets/menu.png';
import home from './assets/home.png';
import musicNote from './assets/musical-note.png';

function App() {
  const CLIENT_ID = "bf129aa3857d4267b7c4577497863ede"
  const REDIRECT_URI = "https://soundwrap.vercel.app"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [profileUrl, setProfileUrl] = useState("")
  const [profileClicked, setProfileClicked] = useState(false)
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const token = window.localStorage.getItem("token")

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const profileImageUrl = response.data.images[0].url

        setProfileUrl(profileImageUrl);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchUserProfile();
  }, []);

  const toggleDropdown = () => {
    setProfileClicked(!profileClicked);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setProfileClicked(false);
      document.getElementById("sideNav").style.width = "0";
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    document.getElementById("sideNav").style.width = "450px";
  };

  return (
    <>
      <div className="App" ref={dropdownRef}>
        <header className="App-header">
          {!isAuthenticated && <h1>Sound Wrap</h1>}
          {!token ?
            <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`} className="login">Login to Spotify</a>
            : profileClicked &&
            <button onClick={logout} className="dropdown-content">
              Logout
              <img src={logoutArrow} alt="Logout Arrow" className="logout-image" />
            </button>
          }
        </header>
      </div>
      {isAuthenticated &&
        <>
          <h3>
            <img src={menu} alt="Menu" className="menu-image" onClick={toggleMenu} />
            Sound Wrap
          </h3>
          <div className="icon-container">
            <img
              src={profileUrl}
              alt="User Icon"
              className="user-icon"
              onClick={toggleDropdown}
            />
          </div>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/artists" element={<Artists />} />
            </Routes>
            <div id="sideNav">
              <h3 className="sidebar-menu">
                <img src={menu} alt="Menu" className="menu-image"/>
                Sound Wrap
              </h3>
              <hr color="#1DB954" className="rounded"/>
              <Link to="/" className='home-link'>
                <img src={home} alt="Back Arrow" className="home-image" />
                Home
              </Link >
              <Link to="/artists" className="artist-link">
                <img src={musicNote} alt="Link Arrow" className="link-image" />
                Artist Reccomendation
              </Link >
            </div>
          </Router>
        </>
      }
    </>
  )
}

export default App;
