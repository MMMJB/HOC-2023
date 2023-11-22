import * as handTrack from "handtrackjs";

type PoseLabel = "open" | "closed" | "pinch" | "point" | "face" | "pointtip" | "pinchtip";
interface Prediction {
  bbox: number[],
  class: number,
  label: PoseLabel,
  score: string,
}

interface Box {
  pose: PoseLabel,
  x: number,
  y: number,
  width: number,
  height: number,
}

(async () => {
  const debuggingTypeDiv = document.getElementById("type")!;

  const model = await handTrack.load({
    flipHorizontal: true,

    // modelType: "ssd320fpnlite",
    modelType: "ssd640fpnlite",

    modelSize: "small",
  });

  const video = document.createElement("video");
  await handTrack.startVideo(video);
  
  const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
  const ctx = canvas.getContext("2d")!;

  let frame = 0;
  const boxes: Box[] = [];

  const draw = (frame: number) => {
    const { width, height } = canvas;
    const scaleX = width / video.width;
    const scaleY = height / video.height;
    
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "white";
    for (const box of boxes) {
      ctx.save();

      ctx.translate(box.x * scaleX, box.y * scaleY);
      ctx.fillRect(0, 0, box.width * scaleX, box.height * scaleY);

      ctx.restore();
    }

    requestAnimationFrame(() => draw(frame + 1));
  }

  const predict = async () => {
    const predictions: Prediction[] = await model.detect(video);
    const hands = predictions.filter(({ label }) => label !== "face");

    if (hands.length) {
      // Clears array
      boxes.splice(0, boxes.length);

      // Sets array of predictions (currently only supports one hand)
      const { label, bbox } = hands.reduce((max, current) => parseFloat(current.score) > parseFloat(max.score) ? current : max);

      debuggingTypeDiv.innerHTML = label;

      boxes.push({
        pose: label,
        x: bbox[0],
        y: bbox[1],
        width: bbox[2],
        height: bbox[3],
      });
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