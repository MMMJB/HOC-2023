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
  const model = await handTrack.load({
    scoreThreshold: 0.2,
  });

  const video = document.createElement("video");
  await handTrack.startVideo(video);
  
  const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
  const ctx = canvas.getContext("2d")!;

  let frame = 0;
  const boxes: Box[] = [];

  const draw = (frame: number) => {
    const { width, height } = canvas;
    
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    

    ctx.fillStyle = "white";
    for (const box of boxes) {
      ctx.save();

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.translate(box.x, box.y);
      ctx.fillRect(0, 0, box.width, box.height);

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
      const hand = hands.reduce((max, current) => parseFloat(current.score) > parseFloat(max.score) ? current : max);

      boxes.push({
        pose: hand.label,
        x: -hand.bbox[0],
        y: hand.bbox[1] - (video.height / 2),
        width: hand.bbox[2],
        height: hand.bbox[3],
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