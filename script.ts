(() => {
  const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
  const ctx = canvas.getContext("2d")!;

  let frame = 0;

  const draw = (frame: number) => {
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width / 2, height / 2);

    requestAnimationFrame(() => draw(frame + 1));
  }

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  window.addEventListener("load", resize);

  requestAnimationFrame(() => draw(frame));
})();