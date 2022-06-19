import React from "react";
import p5 from "p5";
import { AveragedCircles } from "./Drawers/Circles";
import { AveragedSquares } from "./Drawers/Squares";
import { AveragedQuads } from "./Drawers/Quad";
import { AveragedPacmans } from "./Drawers/Pacman";

class AnAveragePacking extends React.Component {
  constructor() {
    super();
    this.myRef = React.createRef();
  }

  Sketch = (p) => {
    let canvas, circles, squares, quads, pacmans;
    let windowRatio = 1.5;

    // Class that represents each circle

    // Initial setup to create canvas and audio analyzers
    p.setup = () => {
      p.frameRate(60);
      p.pixelDensity(2.0);

      p.colorMode(p.HSB, 360, 100, 100);
      p.angleMode(p.DEGREES);

      p.noStroke();

      canvas = p.createCanvas(p.windowWidth / windowRatio, p.windowHeight / windowRatio);

      canvas.mouseClicked(p.handleClick);

      circles = new AveragedCircles(p);
      squares = new AveragedSquares(p);
      quads = new AveragedQuads(p);
      pacmans = new AveragedPacmans(p);
    };

    p.draw = () => {
      // p.clear();
      p.background("#FAF9F6");

      // pacmans.addPacman();
      // pacmans.draw();
      quads.addQuad();
      quads.draw();

      // circles.addCircle();
      // circles.grow();
      // circles.draw();
    };

    p.handleClick = () => {
      circles = new AveragedCircles(p);
      squares = new AveragedSquares(p);
      quads = new AveragedQuads(p);
      p.frameCount = 0;
    };
  };

  // React things to make p5.js work properly and not lag when leaving the current page below
  componentDidMount() {
    if (!this.myP5) {
      this.myP5 = new p5(this.Sketch, this.myRef.current);
    } else {
      this.myP5.remove();
      this.myP5 = new p5(this.Sketch, this.myRef.current);
    }
  }

  componentDidUpdate() {
    this.myP5.remove();
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  componentWillUnmount() {
    this.myP5.remove();
  }

  render() {
    return (
      <div style={{ width: "100vw", background: "white", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f9fadc" }}>
        <div style={{ marginLeft: "auto", marginRight: "auto", boxShadow: "0px 10px 50px 0px rgba(0, 0, 0, 0.15)", backgroundColor: "#FAF9F6" }} ref={this.myRef} />
      </div>
    );
  }
}

export default AnAveragePacking;
