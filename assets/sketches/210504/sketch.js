/// <reference path="../p5def/global.d.ts" />
/// <reference path="../p5def/literals.d.ts" />
/// <reference path="../p5def/constants.d.ts" />

let img_fish;
let img_circle;
let img_char;

let pg;
let pg2;

const OFFSET = {
  char_scale: 230,
  char_x: 35,
  char_y: 20
};

function setup() {
  createCanvas(300, 300).parent("sketch");
  colorMode(HSB, 360, 100, 100, 100);
  frameRate(30);
  noStroke();

  img_fish = loadImage("/assets/sketches/210504/fish.png");
  img_fishhook = loadImage("/assets/sketches/210504/fishhook.png");
  img_circle = loadImage("/assets/sketches/210504/circle.png");
  img_char = loadImage("/assets/sketches/210504/char.png");

  pg = createGraphics(300, 300);



  pg2 = createGraphics(300, 300);
}

function draw() {

  if (frameCount > 30 * 4.5) frameCount = 0;

  img_fish.resize(300, 300);
  img_fishhook.resize(581 / 5, 1416 / 5);
  img_circle.resize(300, 300);
  img_char.resize(OFFSET.char_scale, OFFSET.char_scale);

  background(255);

  // 釣り針
  if (frameCount < 30 * 0.5) {
    image(
      img_fishhook,
      103 + -2 * (frameCount % 2),
      19 + -2 * (frameCount % 2)
    )
  } else {
    image(
      img_fishhook,
      easeOutExpo(103, 167, 30, 30 * 3, frameCount),
      easeOutExpo(19, -158, 30, 30 * 3, frameCount)
    );
  }

  // SABA
  image(img_fish,
    easeOutExpo(-112, 0, 30, 30 * 3, frameCount),
    easeOutExpo(157, 5, 30, 30 * 3, frameCount),
  )

  // 円外側塗りつぶし
  pg.background(255);
  pg.erase();
  pg.ellipse(width / 2, height / 2, 250, 250);
  pg.noErase();
  image(pg, 0, 0);

  // 円
  image(img_circle, 0, 0);

  // 文字
  pg2.image(img_char, OFFSET.char_x, OFFSET.char_y);
  pg2.erase();
  pg2.rect(easeOutExpo(0, 300, 30 * 1.5, 30 * 3, frameCount), 0, 300, 300);
  pg2.noErase();
  image(pg2, 0, 0);

  // カバー
  rect(
    0,
    easeOutExpo(height, 0, 30 * 4, 30 * 4.5, frameCount),
    width,
    height
  );

  // カバー
  rect(
    0,
    easeOutExpo(0, -height, 0, 30 * 0.5, frameCount),
    width,
    height
  );
}

function easeOutExpo(s_pos, e_pos, s_count, e_count, count) {
  if (count <= s_count) return s_pos;
  if (e_count <= count) return e_pos;
  const t = count - s_count;
  const r = -10 / (e_count - s_count);
  return (e_pos - s_pos) * (1 - pow(2, r * t)) + s_pos;
}