---
layouts: default
title: "【p5.js】紐と文字"
date: 2021-05-29 17:00:00 +0900
# last_modified_at: 
# categories: 
tags: JavaScript p5.js 戯れ
header:
  teaser: /assets/sketches/210529/teaser.png
---

紐のシミュレーションと文字表現を組み合わせました。

<script src="https://cdn.jsdelivr.net/npm/p5@1.3.1/lib/p5.js" defer ></script>
<script src="/assets/sketches/210529/sketch.js" defer ></script>
<div id="sketch" style="height: 450px; touch-action: none;"></div>

(利用フォント)  
[Shippori Mincho \- Google Fonts](https://fonts.google.com/specimen/Shippori+Mincho?subset=japanese#standard-styles)

(OpenProcessing)  
[String \- OpenProcessing](https://openprocessing.org/sketch/1207830)

{% highlight javascript %}
let font;
let points;

function preload() {
  font = loadFont("/assets/sketches/210529/font.ttf");
}

function setup() {
  createCanvas(400, 400).parent("sketch");
  colorMode(HSB, 360, 100, 100, 100);
  noFill();
  strokeWeight(2);
  stroke(0, 70, 80, 100);

  const r1 = min(width / 15, height / 15);
  const r2 = min(width / 50, height / 50);

  let pointsArrays = breakTextToSomePointsArrays("紐", font, width / 2 - r1 * 5, height / 2 - r1 * 7, r1)
  pointsArrays = pointsArrays.concat(breakTextToSomePointsArrays("String", font, width / 2 - r2 * 15, height / 2 + r1 * 3, r2));

  points = new Points(pointsArrays);
}

function draw() {
  clear();
  background(0, 5, 100, 5);

  drawingContext.shadowColor = color(0, 0, 0, 50);
  drawingContext.shadowOffsetY = 5;
  drawingContext.shadowBlur = 5;

  points.calc();
  points.draw();
  points.update();
}

function keyTyped() {
  if (key === 'c') {
    points.reset();
  }
}

class Point {
  constructor(x, y, i, points) {
    this.x = x;
    this.y = y;
    this.x_next = x;
    this.y_next = y;
    this.x_original = x;
    this.y_original = y;
    this.i = i;
    this.points = points;
    this.d = null;

    if (this.i !== 0) {
      const p_prev = this.points.getPointAt(this.i - 1);
      this.d = sqrt(pow(p_prev.x - this.x, 2) + pow(p_prev.y - this.y, 2));
    }
  }

  calc() {
    if (this.i === 0) {
      if (frameCount > frameRate()) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        this.x_next += dx / 5;
        this.y_next += dy / 5;
      }
      return;
    }
    const p_prev = this.points.getPointAt(this.i - 1);

    const d_l = sqrt(pow(p_prev.x_next - this.x, 2) + pow(p_prev.y_next - this.y, 2));

    const x_l = p_prev.x_next - this.x;
    const y_l = p_prev.y_next - this.y;

    const dx = x_l - (this.d / d_l) * x_l;
    const dy = y_l - (this.d / d_l) * y_l;

    this.x_next = this.x + dx;
    this.y_next = this.y + dy;
  }

  update() {
    this.x = this.x_next;
    this.y = this.y_next;
  }

  reset() {
    this.x = this.x_original;
    this.y = this.y_original;
    this.x_next = this.x_original;
    this.y_next = this.y_original;
  }

  draw() {
    curveVertex(this.x, this.y);
  }
}

class Points {
  constructor(pointsArrays) {
    this.points = [];

    let num = 0;
    for (let i = 0; i < pointsArrays.length; i = (i + 1) | 0) {
      //文字間を補完するPointを追加
      if (i !== 0) {
        const div = 30;
        const p_start = this.points[this.points.length - 1];
        const p_end = pointsArrays[i][0];
        const d_x = (p_end.x - p_start.x) / div;
        const d_y = (p_end.y - p_start.y) / div;
        for (let c = 1; c < div; c++) {
          this.points.push(
            new Point(p_start.x + d_x * c, p_start.y + d_y * c, num, this)
          );
          num++;
        }
      }
      for (let j = 0; j < pointsArrays[i].length; j = (j + 1) | 0) {
        this.points.push(
          new Point(pointsArrays[i][j].x, pointsArrays[i][j].y, num, this)
        );
        num++;
      }
    }


  }

  calc() {
    for (let i = 0; i < this.points.length; i = (i + 1) | 0) {
      this.points[i].calc();
    }
  }

  update() {
    for (let i = 0; i < this.points.length; i = (i + 1) | 0) {
      this.points[i].update();
    }
  }

  draw() {
    beginShape();
    for (let i = 0; i < this.points.length; i = (i + 1) | 0) {
      this.points[i].draw();
    }
    endShape();
  }

  reset() {
    for (let i = 0; i < this.points.length; i = (i + 1) | 0) {
      this.points[i].reset();
    }
  }

  getPointAt(i) {
    if (i < 0 || this.points.length <= i) {
      return null;
    }
    return this.points[i];
  }

  isOutOfCanvas() {
    const last_point = this.points[this.points.length - 1];
    return last_point.x < 0 || width < last_point.x || last_point.y < 0 || height < last_point.y;
  }
}

function breakTextToSomePointsArrays(text, font, x = 1, y = 1, size = 1, isSeparate = true) {
  const points = font.textToPoints(text, 0, 0, 10, {
    sampleFactor: 3,
    simplifyThreshold: 0
  });

  const breakedArray = [[]];
  const d = 1;

  let min_x = 0;
  let min_y = 0;

  for (let i = 1; i < points.length; i = (i + 1) | 0) {
    if (points[i].x < min_x) {
      min_x = points[i].x;
    }
    if (points[i].y < min_y) {
      min_y = points[i].y;
    }
  }

  for (let i = 1; i < points.length; i = (i + 1) | 0) {
    if (isSeparate && abs(points[i].x - points[i - 1].x) + abs(points[i].y - points[i - 1].y) > d) {
      breakedArray.push([]);
    }

    breakedArray[breakedArray.length - 1].push({
      x: (points[i].x + abs(min_x)) * size + x,
      y: (points[i].y + abs(min_y)) * size + y,
      alpha: points[i].alpha
    });
  }

  return breakedArray;
}
{% endhighlight %}