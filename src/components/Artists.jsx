import { useState } from 'react';
import axios from 'axios'

function Artists() {
  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Search artists based off of query
  const searchArtists = async (e) => {
    e.preventDefault()
    const token = window.localStorage.getItem("token")

    const { data } = await axios.get("https://api.spotify.com/v1/search", {
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

  // Handles the submittion of user input
  const handleSubmit = (e) => {
    searchArtists(e)
    setIsSubmitted(true)
  }

  // Display the reccomended artists to the user
  const renderArtists = () => {
    return artists.slice(0, 8).map(artist => (
      <div key={artist.id}>
        {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt="" /> : <div>No Image</div>}
        {artist.name}
      </div>
    ))
  }

  return (
    <>
      <div className="Artists">
        <h2>Artist Reccomendation</h2>
        {!isSubmitted && <p>Enter your favorite artist:</p>}
        <form onSubmit={handleSubmit} id="searchArtists">
          <input type="text" onChange={e => setSearchKey(e.target.value)} />
          <br/>
          <button type={"submit"} className='search'>Search</button>
        </form>
        {isSubmitted && <p>You may also like: </p>}
        <div className="artistImages">
          {renderArtists()}
        </div>
      </div>
    </>
  )
}

export default Artists;