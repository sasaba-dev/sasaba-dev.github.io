---
layouts: default
title: "【p5.js】ライフゲームと文字"
date: 2021-05-08 12:00:00 +0900
# last_modified_at: 
# categories: 
tags: JavaScript p5.js 戯れ
header:
  teaser: /assets/img/210508/210508_teaser.png
---

ライフゲームと文字表現を組み合わせました。

<script src="https://cdn.jsdelivr.net/npm/p5@1.3.1/lib/p5.js" defer ></script>
<script src="/assets/sketches/210508/sketch.js" defer ></script>
<div id="sketch" style="height: 550px;"></div>

## 概要

今回は、[前回]({% link _posts/2021-05-06-particle_and_temp.md %})の「文字の上だけセルの挙動を変える」という手法を使うと、ライフゲーム上でどのように文字が見えるか試してみました。

> ライフゲーム (Conway's Game of Life[1]) は1970年にイギリスの数学者ジョン・ホートン・コンウェイ (John Horton Conway) が考案した生命の誕生、進化、淘汰などのプロセスを簡易的なモデルで再現したシミュレーションゲームである。  
> [ライフゲーム \- Wikipedia](https://ja.wikipedia.org/wiki/%E3%83%A9%E3%82%A4%E3%83%95%E3%82%B2%E3%83%BC%E3%83%A0)

具体的には、あらかじめオフスクリーンバッファ上に文字を描画しておき、その文字上のセルにだけ倍の「過密」耐性をつけてあります。

これにより、文字上に到達したセルは密集しつつも安定して生き残る状態となり、次第に文字が浮かび上がります。そして、その文字を起点として周囲に「生命」が拡散していく様子を確認できます。

また、通常のライフゲームも楽しめるよう、しばらく放置すると文字が消えます。

## ソースコード

ソースコードを添付しておきます。
ライフゲーム関連の処理はすべて`Cell`, `Cells`両クラスに閉じています。
`Cell`,`Cells`の概要を説明します。

`Cell`クラスが一つひとつのセルを表しており、主なフィールドは以下の通り。

- 自身のセル座標(`x`:左から何個目、`y`:上から何個目)
- 現在生きているか/死んでいるか(`isColored`)
- 次のフレームに生きるか/死ぬか(`isColored_next`)

また、主な関数は以下の通り。

- 周囲セルの生死を確認し、自身の次フレームでの生死を判定する(`update()`)
- 自身の次フレーム生死をもとに、現在の生死を更新する(`changeColor()`)
- 自身が生きていれば、四角形を描画する(`draw()`)

`Cells`クラスがセル全体を管理しており、主なフィールドは以下の通り。

- 横のセル数、縦のセル数(`_w_num`, `_h_num`)
- セル配列(`_cells_array`)

また、主な関数は以下の通り。

- 特定座標のセルの生死を調べて返す(`isColoredAt()`)

このライフゲーム実装の一番のキモは`Cell.update()`で、セルの生死ルールはすべてここに記述します。この関数の内容を書き換えることで、コードを流用してオレオレライフゲームが作れるはずです、たぶん。


{% highlight javascript %}
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
{% endhighlight %}