/// <reference path="../p5types/global.d.ts" />
/// <reference path="../p5types/literals.d.ts" />
/// <reference path="../p5types/constants.d.ts" />
/// <reference path="../p5types/index.d.ts" />

let pg;

const points = [];
const POINTS_NUM = 5000;
const TEMP_MAX = 30;

let temp = TEMP_MAX;
let is_dead = false;
let dead_frame = 0;

function setup() {
  createCanvas(480, 270).parent("sketch");
  colorMode(HSB, 360, 100, 100, 100);
  frameRate(10);
  smooth();

  pg = createGraphics(width, height);
  pg.colorMode(HSB, 360, 100, 100, 100);
  pg.smooth();

  for (let i = 0; i < POINTS_NUM; i = (i + 1) | 0) {
    points.push(
      new Point(
        random(0, width),
        random(0, height),
        random(-temp, temp),
        random(-temp, temp)));
  }
}

function draw() {
  clear();
  background(120, 30, 10);

  pg.clear();
  pg.textSize(100);
  pg.fill(255);
  pg.textAlign(CENTER, CENTER);
  pg.textFont("Helvetica");
  pg.textStyle(BOLD);
  pg.stroke(255);
  pg.strokeWeight(5);
  pg.text("Particle", width / 2, height / 2);

  blendMode(ADD)

  stroke(
    map(temp, 0, TEMP_MAX, 240, 0),
    map(temp, 0, TEMP_MAX, 10, 40),
    100,
    100);

  beginShape(POINTS);
  for (let i = 0; i < POINTS_NUM; i = (i + 1) | 0) {
    points[i].update();
    points[i].draw();
  }
  endShape();

  if (!is_dead && frameCount % 1 === 0) {
    temp -= 1;
  }

  if (temp === 0 && !is_dead) {
    dead_frame = frameCount;
    is_dead = true;
  }

  if (is_dead && frameCount - dead_frame > 10 * 4) {
    const target_temp = floor(
      map(mouseY, 0, height, TEMP_MAX, 0)
    );

    if (temp < target_temp) {
      temp += 1;
    } else if (target_temp < temp) {
      temp -= 1;
    }

    if (temp < 0) {
      temp = 0;
    }
    if (TEMP_MAX < temp) {
      temp = TEMP_MAX;
    }
  }

  text("Temp: " + temp, 5, 12);
}

class Point {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
  }

  update() {
    if (pg.get(this.x, this.y)[0] === 255) {
      if (temp < 5) {
        this.dx = random(-10, 10);
        this.dy = random(-10, 10);
      } else {
        this.dx = random(-5, 5);
        this.dy = random(-5, 5);
      }
    } else {
      this.dx = random(-temp, temp);
      this.dy = random(-temp, temp);
    }

    this.x += this.dx;
    this.y += this.dy;

    if (this.x < 0) {
      this.dx *= -1;
      this.x = 0;
    } else if (width < this.x) {
      this.dx *= -1;
      this.x = width;
    }

    if (this.y < 0) {
      this.dy *= -1;
      this.y = 0;
    } else if (height < this.y) {
      this.dy *= -1;
      this.y = height;
    }
  }

  draw() {
    vertex(this.x, this.y);
  }
}
