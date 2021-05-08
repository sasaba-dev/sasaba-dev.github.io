let CELLS;
let LIVE_COLOR;
let BG_COLOR;
let pg;

const RECT_WIDTH = 5;
const FPS = 30;

function setup() {
  createCanvas(500, 500).parent("sketch");
  colorMode(HSB, 360, 100, 100, 100);
  frameRate(FPS);
  noStroke();
  smooth();

  LIVE_COLOR = color(200, 50, 50);
  BG_COLOR = color(200, 3, 95, 80);

  CELLS = new Cells(floor(width / RECT_WIDTH), floor(height / RECT_WIDTH));

  pg = createGraphics(width, height);
  pg.noStroke();

}

function draw() {
  background(BG_COLOR);

  if (frameCount < FPS * 10) {
    pg.background(255);
    pg.fill(0);
    pg.textAlign(CENTER, CENTER);
    pg.textSize(150);
    pg.textStyle(BOLD);
    pg.text("LIFE", width / 2, height / 2 - 80);
    pg.text("GAME", width / 2, height / 2 + 80);
    pg.rect(0, easeOutExpo(height, 0, FPS * 7, FPS * 8, frameCount), width, height);
    pg.fill(255);
    pg.rect(-1, easeOutExpo(height + 1, -1, FPS * 9, FPS * 10, frameCount), width + 2, height + 2);
  } else {
    pg.fill(0);
    if (mouseIsPressed)
      pg.ellipse(mouseX, mouseY, 50, 50);
  }
  CELLS.update();
  CELLS.draw();
}

class Cell {
  constructor(x, y, isColored) {
    this._x = x;
    this._y = y;
    this._isColored = isColored;
    this._isColored_next = false;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get isColored() {
    return this._isColored;
  }

  set isColored(v) {
    this._isColored = v;
  }

  set isColored_next(v) {
    this._isColored_next = v;
  }

  update(cells) {
    const count = this.countArroundColoredCells(cells);
    this._count = count;
    if (red(pg.get(this._x * RECT_WIDTH, this._y * RECT_WIDTH)) === 0) {
      if (this._isColored) {
        if (count === 2 || count === 3 || count === 4 || count === 5) {
          this._isColored_next = true;
        } else {
          this._isColored_next = false;
        }
      } else {
        if (count === 3) {
          this._isColored_next = true;
        } else {
          this._isColored_next = false;
        }
      }
    } else {
      if (this._isColored) {
        if (count === 2 || count === 3) {
          this._isColored_next = true;
        } else {
          this._isColored_next = false;
        }
      } else {
        if (count === 3) {
          this._isColored_next = true;
        } else {
          this._isColored_next = false;
        }
      }
    }
  }

  countArroundColoredCells(cells) {
    let count = 0;
    for (let dx = -1; dx <= 1; dx = (dx + 1) | 0) {
      for (let dy = -1; dy <= 1; dy = (dy + 1) | 0) {
        if (dx === 0 && dy === 0) {
          continue;
        }
        if (cells.isColoredAt(this._x + dx, this._y + dy)) {
          count++;
        }
      }
    }
    return count;
  }

  changeColor() {
    this._isColored = this._isColored_next;
  }

  draw(pad_x, pad_y, w_px, h_px, color) {
    if (this._isColored) {
      fill(color);
      rect(pad_x + w_px * this.x, pad_y + h_px * this.y, w_px, h_px);
    }
  }
}

class Cells {
  constructor(w_num, h_num) {
    this._w_num = w_num;
    this._h_num = h_num;
    this._cells_array = [];
    for (let y = 0; y < this._h_num; y = (y + 1) | 0) {
      for (let x = 0; x < this._w_num; x = (x + 1 | 0)) {
        this._cells_array.push(
          new Cell(x, y, floor(random(0, 10)) === 1)
        );
      }
    }
  }

  init() {
    for (let y = 0; y < this._h_num; y = (y + 1) | 0) {
      for (let x = 0; x < this._w_num; x = (x + 1) | 0) {
        this._cells_array[y * this._w_num + x].isColored = floor(random(0, 10)) === 1;
        this._cells_array[y * this._w_num + x].isColored_next = false;
      }
    }
  }

  isColoredAt(x, y) {
    if (x < 0) {
      x += this._w_num;
    }
    if (this._w_num - 1 < x) {
      x -= this._w_num;
    }
    if (y < 0) {
      y += this._h_num;
    }
    if (this._h_num - 1 < y) {
      y -= this._h_num;
    }
    return this._cells_array[y * this._w_num + x].isColored;
  }

  update() {
    for (let y = 0; y < this._h_num; y = (y + 1) | 0) {
      for (let x = 0; x < this._w_num; x = (x + 1) | 0) {
        this._cells_array[y * this._w_num + x].update(this);
      }
    }
  }

  draw() {
    for (let y = 0; y < this._h_num; y = (y + 1) | 0) {
      for (let x = 0; x < this._w_num; x = (x + 1) | 0) {
        this._cells_array[y * this._w_num + x].draw(0, 0, RECT_WIDTH, RECT_WIDTH, LIVE_COLOR);
      }
    }

    for (let y = 0; y < this._h_num; y = (y + 1) | 0) {
      for (let x = 0; x < this._w_num; x = (x + 1) | 0) {
        this._cells_array[y * this._w_num + x].changeColor();
      }
    }
  }
}

function easeOutExpo(s_pos, e_pos, s_count, e_count, count) {
  if (count <= s_count) return s_pos;
  if (e_count <= count) return e_pos;
  const t = count - s_count;
  const r = -10 / (e_count - s_count);
  return (e_pos - s_pos) * (1 - pow(2, r * t)) + s_pos;
}
