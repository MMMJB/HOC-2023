(() => {
  const canvas: HTMLCanvasElement = document.querySelector("canvas")!;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  window.addEventListener("load", resize);
})();