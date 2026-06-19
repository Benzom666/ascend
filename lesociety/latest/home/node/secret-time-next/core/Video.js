import React from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const VideoJS = (props) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const { options, onReady } = props;

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");

      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");
        onReady && onReady(player);
      }));

      // player.on("ended", () => {
      //   player.currentTime(0); // Reset the current time to replay
      //   player.play();
      // });

      // You could update an existing player in the `else` block here
      // on prop change, for example:
      // Hide fullscreen button
      player.controlBar.removeChild("FullscreenToggle");
      player.controlBar.removeChild("PictureInPictureToggle");
      // Disable double-click to fullscreen feature
      player.on("dblclick", (event) => {
        event.preventDefault();
      });
      // stop open fullscreen on iphone
      player.on("fullscreenchange", (event) => {
        if (player.isFullscreen()) {
          player.exitFullscreen();
        }
      });
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};

const VideoComponent = () => {
  const playerRef = React.useRef(null);

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: "/videos/output.mp4",
        type: "video/mp4",
      },
    ],
    html5: {
      // Enable inline playback on iOS
      playsinline: true,
    },
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };
  return (
    <div className="App">
      <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
    </div>
  );
};

export default VideoComponent;
