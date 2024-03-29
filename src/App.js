import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import TrackList from "./components/Tracklist";
import {
  Button,
  Container,
  Grid,
} from "@mui/material";
import Playlist from "./components/Playlist";
import SearchBar from "./components/SearchBar/SearchBar";
import theme from "./Theme";
import {
  generateAccessToken,
  authentificate,
  fetchTracks,
  createPlaylist,
} from "./spotify_access_token";

const App = () => {
  const [tracks, setTracks] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [playlist, setPlaylist] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const [previewAudio, setPreviewAudio] = useState("");
  const [currentTimeout, setCurrentTimeout] = useState();

  const setTrackList = async (query) => {
    console.log(query)
    const trackList = await fetchTracks(query);
    console.log("tracks in app", trackList);
    setTracks(trackList);
  };

  useEffect(() => {
    const fetchData = async () => {
      const spotifyToken = await generateAccessToken();
      console.log("App.js monted. there is a token", spotifyToken);
      setAccessToken(spotifyToken);
    };
    fetchData();

    setTrackList("Blues");

  }, []);

  const playSample = (previewUrl, track) => {
    const currentAudio = previewAudio;
    const audio = new Audio(previewUrl);

    // const resetPlayButton =  () => {
    //   let updatedArray =  [...tracks];
    //   updatedArray.map((track) => (track.isPlaying = false));
    //   setTracks(updatedArray);
    // }

    const resetPlayButton = () => {
      setTracks(prevTracks => {
        const updatedArray = prevTracks.map(track => ({ ...track, isPlaying: false }));
        return updatedArray;
      });
    };
    

    

    

    if (previewAudio) { // a song is currently playing
      
      console.log("song currently playig");

      resetPlayButton()

      currentAudio.pause();
    }

      
    if (currentAudio.src !== previewUrl) { // the song currently playing is not the one selected
      
      const objectIndex = tracks.findIndex((obj) => obj.uri === track.uri);
      const updateState = () => {
        const updatedObject = {
          ...tracks[objectIndex],
          isPlaying: true,
        };
        let updatedArray = [...tracks];
        //updatedArray.map((track) => (track.isPlaying = false));
        updatedArray[objectIndex] = updatedObject;

        setTracks(updatedArray);

        clearTimeout(currentTimeout);
        
        setCurrentTimeout(setTimeout(() => {resetPlayButton()},"30000"))
        
      };

      updateState();

      setPreviewAudio(audio);
      audio.play();
    } else {
      setPreviewAudio('')
    }
  };

  const updatePlaylist = (track) => {
    track.Added = true;
    track.isPlaying = "disabled"

    setPlaylist((prev) => {
      //let isIncluded = prev.some((t) => t.uri === track.uri);
      if (prev.some((t) => t.uri === track.uri)) {
        return prev.filter((t) => t.uri !== track.uri);
      } else {
        return [...prev, track];
      }
    });
  };

  const handleNameChange = ({ target }) => {
    const { value } = target;
    setPlaylistName(value);
  };

  const updateTrackList = (track) => {
    const objectIndex = tracks.findIndex((obj) => obj.uri === track.uri);
    const updateState = (value) => {
      const updatedObject = {
        ...tracks[objectIndex],
        Added: value,
      };
      const updatedArray = [...tracks];

      updatedArray[objectIndex] = updatedObject;
      setTracks(updatedArray);
    };

    if (track.Added === true) {
      updateState(false);
    } else {
      updateState(true);
    }

    updatePlaylist(track);

    console.log(playlist);
  };

  if (accessToken) {
    return (
      <>
        <ThemeProvider theme={theme}>
          <Container
            maxWidth="sm"
            style={{ marginTop: "100px", marginBottom: "100px" }}
          >
            <SearchBar setTrackList={setTrackList} />
          </Container>
          <Container sx={{ border: "none" }}>
            <Grid container spacing={2} alignContent="center">
              <Grid item xs={8}>
                <TrackList
                  tracks={tracks}
                  updateTrackList={updateTrackList}
                  playSample={playSample}
                />
              </Grid>
              <Grid item xs={4}>
                <Playlist
                  playlistName={playlistName}
                  setPlaylistName={setPlaylistName}
                  handleNameChange={handleNameChange}
                  playlist={playlist}
                  setPlaylist={setPlaylist}
                  updateTrackList={updateTrackList}
                  createPlaylist={createPlaylist}
                  accessToken={accessToken}
                />
              </Grid>
            </Grid>
          </Container>
        </ThemeProvider>
      </>
    );
  } else {
    return (
      <>
        {" "}
        <ThemeProvider theme={theme}>
          <Container
            maxWidth="sm"
            style={{ marginTop: "100px", marginBottom: "100px" }}
          >
            <Button variant="contained" onClick={authentificate}>
              Log In
            </Button>
          </Container>
        </ThemeProvider>
      </>
    );
  }
};

export default App;
