import * as handTrack from "handtrackjs";

type PoseLabel = "open" | "closed" | "pinch" | "point" | "face" | "pointtip" | "pinchtip";
interface Prediction {
  bbox: number[];
  class: number;
  label: PoseLabel;
  score: string;
}

interface Box {
  pose: PoseLabel;
  posePrevious: PoseLabel;
  pos: {
    x: number;
    y: number;
  }
  interpolated: {
    x: number;
    y: number;
  }
}

(async () => {
  const debuggingTypeDiv = document.getElementById("type")!;

  const model = await handTrack.load({
    flipHorizontal: true,

    // modelType: "ssd320fpnlite",
    modelType: "ssd640fpnlite",

    modelSize: "large",
  });

  const video = document.createElement("video");
  await handTrack.startVideo(video);
  
  const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
  const ctx = canvas.getContext("2d")!;

  let frame = 0;
  const box: Box = {
    pose: "closed",
    posePrevious: "closed",
    pos: {
      x: 0,
      y: 0,
    },
    interpolated: {
      x: 0,
      y: 0,
    },
  };

  const draw = (frame: number) => {
    const { width, height } = canvas;
    const scaleX = width / video.width;
    const scaleY = height / video.height;
    
    // ctx.clearRect(0, 0, width, height);

    // ctx.fillStyle = "black";
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, width, height);

    box.interpolated.x = box.pos.x - (box.pos.x - box.interpolated.x) * 0.88;
    box.interpolated.y = box.pos.y - (box.pos.y - box.interpolated.y) * 0.88;

    ctx.save();
    ctx.fillStyle = "rgba(255,0,0,0.5)";
    ctx.beginPath();
    ctx.translate(box.pos.x * scaleX, box.pos.y * scaleY);
    ctx.arc(0, 0, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.translate(box.interpolated.x * scaleX, box.interpolated.y * scaleY);
    ctx.arc(0, 0, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    requestAnimationFrame(() => draw(frame + 1));
  }

  const predict = async () => {
    const predictions: Prediction[] = await model.detect(video);
    const hands = predictions.filter(({ label }) => label !== "face");

    if (hands.length) {
      // Sets array of predictions (currently only supports one hand)
      const { label, bbox } = hands.reduce((max, current) => parseFloat(current.score) > parseFloat(max.score) ? current : max);

      debuggingTypeDiv.innerHTML = label;

      const x = bbox[0];
      const y = bbox[1];
      const width = bbox[2];
      const height = bbox[3];

      box.posePrevious = box.pose;
      box.pose = label;
      box.pos.x = x + (width / 2);
      box.pos.y = y + (height / 2);
    }

    requestAnimationFrame(predict);
  }

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  window.addEventListener("load", resize);

  resize();

  predict();
  draw(frame);
})();