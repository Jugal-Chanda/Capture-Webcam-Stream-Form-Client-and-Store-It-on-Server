// Prefer camera resolution nearest to 1280x720.
const constraints = {
  audio: true,
  video: { width: 1280, height: 720 },
};

const SID =
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

const video = document.querySelector("video");
var track = null;
var videoStream = null;

navigator.mediaDevices
  .getUserMedia(constraints)
  .then((mediaStream) => {
    track = mediaStream.getVideoTracks()[0];
    videoStream = mediaStream;
    video.srcObject = mediaStream;
    console.log(video.srcObject);
    video.onloadedmetadata = () => {
      video.play();
    };
  })
  .catch((err) => {
    // always check for errors at the end.
    console.error(`${err.name}: ${err.message}`);
  });

const getFrame = () => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  const data = canvas.toDataURL("image/png");

  return {
    id: SID,
    data: data.replace("data:image/png;base64,", ""),
  };
};

const WS_URL = "ws://127.0.0.1:5002/echo";
const FPS = 30;
const ws = new WebSocket(WS_URL);
ws.onopen = () => {
  console.log(`Connected to ${WS_URL}`);
  setInterval(() => {
    if (videoStream != null) {
      console.log("sending frame");
      ws.send(JSON.stringify(getFrame()));
    }
  }, 1000 / FPS);
};

const stopvideo = () => {
  videoStream = null;
  track.stop();
  ws.send(JSON.stringify({ id: SID, data: null }));
};
