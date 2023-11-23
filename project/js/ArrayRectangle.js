export default class ArrayRectangle {
  constructor(pos, val, x, y, width, height, canvas, color = "gray") {
    this.pos = pos;
    this.val = val;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.canvas = canvas;
    //console.log(canvas);
  }

  draw = () => {
    this.canvas.getContext("2d").fillStyle = this.color;
    this.canvas
      .getContext("2d")
      .fillRect(
        this.x,
        this.y,
        this.width,
        this.height
      );
  };

  resetColor = () => this.setColor("gray");

  setColor = (color) => {
    if (!this.isSorted()) {
      this.color = color;
    }
  };

  isSorted = () => this.color === "MediumSpringGreen";

  sorted = () => (this.color = "MediumSpringGreen");

  setValue = (v, color) => {
    if (!this.isSorted()) {
      this.height = v;
      this.setColor(color);
    }
  };
  getValue = (v) => this.height;
}
