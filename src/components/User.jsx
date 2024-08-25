import { useEffect, useState, useRef } from 'react'
import axios from 'axios'

function User() {
  const [profileUrl, setProfileUrl] = useState("")
  const [profileClicked, setProfileClicked] = useState(false)
  const dropdownRef = useRef(null);

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
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="icon-container" ref={dropdownRef}>
        <img
          src={profileUrl}
          alt="User Icon"
          className="user-icon"
          onClick={toggleDropdown}
        />
      </div>
      {profileClicked && (
        <div className="dropdown-content">
          <div className='square'></div>
        </div>
      )}
    </>
  )
}

export default User;