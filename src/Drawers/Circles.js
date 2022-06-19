import { darker } from "../Palettes/Colors";

class AveragedCircle {
  // Constructed with a location (x,y), a diameter, and a boolean isSource
  colors = darker;
  p;

  constructor(p, x, y, diameter, isSource) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.d = diameter;
    this.isSource = isSource;
    this.kNN = [];
    this.growing = true;

    if (isSource) {
      this.hue = p.random(360);
    } else {
      this.hue = 0;
    }
  }

  draw() {
    if (Math.round(this.x % 2) === 0) {
      const color = this.colors[Math.round(this.y / 2 / 100)] || "#d9d9d9";
      this.p.fill(this.p.color(color));

      this.p.strokeWeight(1);
      this.p.circle(this.x, this.y, this.d);
    }
  }

  // Grows until it hits another circle
  grow() {
    this.d += 2;
  }

  // Returns true if the given x,y point is within the current circle + slack
  collisionCheck(x, y, d, slack) {
    return this.p.dist(this.x, this.y, x, y) <= this.d / 2 + d / +slack;
  }
}

export class AveragedCircles {
  p;

  constructor(p) {
    this.circles = [];
    this.MAX_CIRCLES = 600; // Max number of circles that can be added
    this.NUM_SOURCES = 27; // Not a hard limit on the number of sources, but effects the overall probability of a circle being a source
    this.MAX_ATTEMPTS = 750; // Max attempts to hit the target number of circles added per frame
    this.FIND_KNN_NUM = 500; // Number of circles when the KNN is found for each point and colors start changing
    this.foundKNN = false;
    this.k = 7; // Number of closes tneighbors used to calculate average color
    this.sat = 43;
    this.brightness = 71;
    this.p = p;
  }

  addCircle() {
    if (this.circles.length >= this.MAX_CIRCLES) {
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
      let isSource = this.p.random(this.MAX_CIRCLES) < this.NUM_SOURCES;
      let d = 6;

      let isValid = true;
      for (let i = 0; i < this.circles.length; i++) {
        if (this.circles[i].collisionCheck(x, y, d, 3)) {
          isValid = false;
          break;
        }
      }
      if (isValid) {
        this.circles.push(new AveragedCircle(this.p, x, y, d, isSource));
        numAdded++;

        // If we already calculated KNN for the existing FIND_KNN_NUM of circles, we need to calculate the KNN for the new circle
        if (this.circles.length > this.FIND_KNN_NUM) {
          let idx = this.circles.length - 1;
          this.findKNN(idx);
        }
      }
      if (numAdded === target) {
        break;
      }
    }
  }

  grow() {
    for (let i = 0; i < this.circles.length; i++) {
      let curCircle = this.circles[i];
      if (curCircle.growing) {
        curCircle.grow();
        // NOTE: this is inefficient and has N^2 runtime but N is small so should be okay
        for (let j = 0; j < this.circles.length; j++) {
          if (curCircle !== this.circles[j]) {
            if (this.circles[j].collisionCheck(curCircle.x, curCircle.y, curCircle.d, 2)) {
              curCircle.growing = false;
            }
          }
        }
      }
    }
  }

  updateColors() {
    // If we haven't found the KNN yet, we need to find it for each existing point
    if (!this.foundKNN) {
      for (let i = 0; i < this.circles.length; i++) {
        this.findKNN(i);
      }
      this.foundKNN = true;
    }

    for (let i = 0; i < this.circles.length; i++) {
      let curCircle = this.circles[i];

      if (!curCircle.isSource) {
        let targetHueX = 0;
        let targetHueY = 0;

        for (let j = 0; j < curCircle.kNN.length; j++) {
          let neighborHue = this.circles[curCircle.kNN[j]].hue;
          targetHueX += this.p.cos(neighborHue - 180);
          targetHueY += this.p.sin(neighborHue - 180);
        }
        curCircle.hue = this.p.atan2(targetHueY, targetHueX) + 180;
      } else {
        curCircle.hue = (curCircle.hue + 0.6) % 360;
      }
      // curCircle.color = this.p.color(curCircle.hue, this.sat, this.brightness);
    }
  }

  draw() {
    for (let i = 0; i < this.circles.length; i++) {
      this.circles[i].draw();
    }
  }

  findKNN(idx) {
    let curCircle = this.circles[idx];
    if (!curCircle.isSource) {
      let closestCircles = [];
      let maxDist;

      for (let j = 0; j < this.circles.length; j++) {
        let nextCircle = this.circles[j];
        let distance = this.p.dist(curCircle.x - 10, curCircle.y + 80, nextCircle.x, nextCircle.y);

        if (closestCircles.length < this.k || distance < maxDist) {
          closestCircles.push({ idx: j, dist: distance });
          closestCircles.sort((a, b) => (a.dist < b.dist ? -1 : 1));
          if (closestCircles.length > this.k) {
            closestCircles.pop();
          }
          maxDist = closestCircles[closestCircles.length - 1].dist;
        }
      }
      this.circles[idx].kNN = closestCircles.map((a) => a.idx);
    }
  }
}
