import { useState } from "react";
import axios from "axios";

const Home = () => {
  const [inputGenre, setInputGenre] = useState("");
  const [genreMatches, setGenreMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [playlistRecommendation, setPlaylistRecommendation] = useState(null);

  // Utility function to delay between requests
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Batch process array with delay
  const batchProcess = async (
    items,
    processFn,
    batchSize = 10,
    delayMs = 250
  ) => {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processFn));
      results.push(...batchResults);

      // Update progress
      setProgress((prev) => ({
        ...prev,
        current: Math.min(prev.total, i + batchSize),
      }));

      if (i + batchSize < items.length) {
        await delay(delayMs);
      }
    }

    return results;
  };

  // Get all of the user's playlists
  const getPlaylists = async () => {
    const token = window.localStorage.getItem("token");

    try {
      const { data } = await axios.get(
        "https://api.spotify.com/v1/me/playlists",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data.items;
    } catch (error) {
      console.error("Error fetching playlists:", error);
      throw new Error("Failed to fetch playlists");
    }
  };

  // Gets all tracks from a playlist
  const getPlaylistTracks = async (playlist) => {
    const token = window.localStorage.getItem("token");

    try {
      const { data } = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data.items.map((item) => ({
        ...item,
        playlist: { name: playlist.name },
      }));
    } catch (error) {
      console.error(
        `Error fetching tracks for playlist ${playlist.name}:`,
        error
      );
      return [];
    }
  };

  // Fetch artist details
  const getArtistDetails = async (track) => {
    if (!track.track?.artists?.[0]?.id) return null;

    const token = window.localStorage.getItem("token");
    try {
      const { data } = await axios.get(
        `https://api.spotify.com/v1/artists/${track.track.artists[0].id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        data.genres.some((genre) =>
          genre.toLowerCase().includes(inputGenre.toLowerCase())
        )
      ) {
        return {
          playlist: track.playlist.name,
          track: track.track.name,
          artist: data.name,
          genres: data.genres,
          albumCover: track.track.album.images[0]?.url,

          spotifyUrls: {
            artist: data.external_urls.spotify,
            playlist: track.playlist.external_urls?.spotify,
          },
        };
      }
    } catch (error) {
      console.error("Error fetching artist details:", error);
      return null;
    }
  };

  // Handle the search process
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsFinished(false);
    setError("");
    setGenreMatches([]);
    setPlaylistRecommendation(null);
    setProgress({ current: 0, total: 0 });

    try {
      // Get playlists
      const userPlaylists = await getPlaylists();

      // Get tracks from playlists in batches
      setProgress({ current: 0, total: userPlaylists.length });
      const allTracks = await batchProcess(
        userPlaylists,
        getPlaylistTracks,
        3,
        500
      );

      // Flatten tracks array
      const flatTracks = allTracks.flat();

      // Process artists in batches
      setProgress({ current: 0, total: flatTracks.length });
      const matchResults = await batchProcess(
        flatTracks,
        getArtistDetails,
        10,
        250
      );

      // Filter out null results and set matches
      const validMatches = matchResults.filter(Boolean);
      setGenreMatches(validMatches);

      // Calculate playlist frequencies
      if (validMatches.length > 0) {
        const playlistFrequencies = validMatches.reduce((acc, match) => {
          acc[match.playlist] = (acc[match.playlist] || 0) + 1;
          return acc;
        }, {});

        // Find the playlist with the most matches
        const topPlaylist = Object.entries(playlistFrequencies).reduce(
          (top, [playlist, count]) =>
            count > (top.count || 0) ? { playlist, count } : top,
          {}
        );

        // Set recommendation if we found matches
        setPlaylistRecommendation({
          name: topPlaylist.playlist,
          matchCount: topPlaylist.count,
          totalMatches: validMatches.length,
        });
      }
    } catch (err) {
      setError(err.message || "An error occurred while searching");
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsFinished(true);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}
      >
        Not sure which of your playlists to listen to?
      </h2>
      <p>Enter a music genre below to get a personalized recommendation</p>

      <form onSubmit={handleSearch} style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={inputGenre}
            onChange={(e) => setInputGenre(e.target.value)}
            placeholder="Ya like jazz?"
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputGenre}
            style={{
              padding: "8px 16px",
              backgroundColor: isLoading ? "#ccc" : "#1db954",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {playlistRecommendation && (
        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            backgroundColor: "#f0f9f4",
            borderRadius: "8px",
            border: "1px solid #1db954",
          }}
        >
          <p style={{ color: "#1db954", fontWeight: "500" }}>
            🎵 Recommended Playlist:{" "}
            <strong>{playlistRecommendation.name}</strong>
          </p>
          <p style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
            This playlist has {playlistRecommendation.matchCount} out of{" "}
            {playlistRecommendation.totalMatches} total {inputGenre} tracks
            found in your library
          </p>
        </div>
      )}

      {isLoading && progress.total > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <p>
            Processing: {progress.current} of {progress.total}
          </p>
          {progress.current >= 50 && progress.current <= 150 && (
            <p>
              Whew! You listen to a lot of songs.
            </p>
          )}
          {progress.current > 150 && progress.current <= 250 && (
            <p>
            Are these all your playlists? Wow!
            </p> 
          )}
          {progress.current > 250 && progress.current <= 350 && (
            <p>
            Over 250 songs already? This may take a minute.
            </p> 
          )}

          {progress.current > 350 && (
            <p>
            Too much music? No such thing!
            </p> 
          )}
          <div
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "#eee",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
                height: "100%",
                backgroundColor: "#1db954",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</div>
      )}

      {genreMatches.length > 0 && (
        <div
          style={{
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {genreMatches.map((match, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                overflow: "hidden",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", gap: "16px" }}>
                {match.albumCover && (
                  <img
                    src={match.albumCover}
                    alt="Album cover"
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                )}
                <div>
                  <p style={{ fontSize: "14px", color: "#666" }}>
                    <a
                      href={match.spotifyUrls.artist}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#666", textDecoration: "none" }}
                    >
                      {match.artist}
                    </a>
                  </p>
                  <p style={{ fontSize: "14px", color: "#666" }}>
                    Playlist:{" "}
                    <a
                      href={match.spotifyUrls.playlist}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#666", textDecoration: "none" }}
                    >
                      {match.playlist}
                    </a>
                  </p>
                  <p style={{ fontSize: "14px", color: "#888" }}>
                    Genres: {match.genres.join(", ")}
                  </p>
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Black.png"
                      alt="Spotify"
                      style={{ 
                        height: "20px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {inputGenre && isFinished && genreMatches.length === 0 && (
        <p style={{ color: "#666" }}>No matches found for {inputGenre}</p>
      )}
    </div>
  );
};

export default Home;
