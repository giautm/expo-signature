class Point {
  constructor({x, y}) {
    this.x = x;
    this.y = y;
    this.time = Date.now();
  }

  equalTo = (point) => {
    if (point) {
      return (
        (this.x === point.x || Math.abs(point.x - this.x) <= 0.0001) &&
        (this.y === point.y || Math.abs(point.y - this.y) <= 0.0001) 
      );
    }

    return false;
  }

  getVector = (point) => {
    return {
      x: point.x - this.x,
      y: point.y - this.y,
    };
  }
}

export default Point;