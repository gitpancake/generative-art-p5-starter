import { colors } from "../Palettes/Colors";

class Pacman {
  // Constructed with a location (x,y), a diameter, and a boolean isSource
  p;

  constructor(p, x, y, diameter, isSource) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.d = diameter;
    this.isSource = isSource;
    this.kNN = [];
    this.growing = true;
    this.colors = colors;

    if (isSource) {
      this.hue = p.random(360);
    } else {
      this.hue = 0;
    }
  }

  draw() {
    this.p.fill(this.p.color("#fdff00"));

    this.p.strokeWeight(2);

    this.p.arc(this.x, this.y, 100, 100, 20, 1);
  }

  // Grows until it hits another circle
  grow() {
    this.d += 0.2;
  }

  // Returns true if the given x,y point is within the current circle + slack
  collisionCheck(x, y, d, slack) {
    return this.p.dist(this.x, this.y, x, y) <= this.d / 2 + d / +slack;
  }
}

export class AveragedPacmans {
  p;

  constructor(p) {
    this.squares = [];
    this.MAX_SQUARES = 100; // Max number of circles that can be added
    this.NUM_SOURCES = 27; // Not a hard limit on the number of sources, but effects the overall probability of a circle being a source
    this.MAX_ATTEMPTS = 27; // Max attempts to hit the target number of circles added per frame
    this.FIND_KNN_NUM = 100; // Number of circles when the KNN is found for each point and colors start changing
    this.foundKNN = false;
    this.k = 7; // Number of closes tneighbors used to calculate average color
    this.sat = 90;
    this.brightness = 100;
    this.p = p;
  }

  addPacman() {
    if (this.squares.length >= this.MAX_SQUARES) {
      return -1;
    }

    // Attempt to add target number of valid circles within MAX_ATTEMPTS
    let target = 1 + this.p.constrain(this.p.floor(this.p.frameCount / 240), 1, 20); // Shamelessly Stolen from Daniel Shiffman
    let numAttempts = 0;
    let numAdded = 0;

    while (numAttempts < this.MAX_ATTEMPTS) {
      numAttempts++;
      let x = this.p.random(this.p.width);
      let y = this.p.random(this.p.height);
      let isSource = this.p.random(this.MAX_SQUARES) < this.NUM_SOURCES;
      let d = 30;

      let isValid = true;
      for (let i = 0; i < this.squares.length; i++) {
        if (this.squares[i].collisionCheck(x, y, d, 3)) {
          isValid = false;
          break;
        }
      }
      if (isValid) {
        this.squares.push(new Pacman(this.p, x, y, d, isSource));
        numAdded++;
      }
      if (numAdded === target) {
        break;
      }
    }
  }

  draw() {
    for (let i = 0; i < this.squares.length; i++) {
      this.squares[i].draw();
    }
  }
}
