
import {
  makeWeightedPoint,
  weightFromVector,
} from './WeightedPoint';

import {
  subdivisionSegments,
  subdivider,
} from './BezierProvider';




const getBezierPoints = (fourPoints) => {
  console.log('Controll points', fourPoints);
  const segments = subdivisionSegments(fourPoints[0],
    fourPoints[1], fourPoints[2], fourPoints[3]);

  const vector = Vector2.sub(fourPoints[3], fourPoints[0]);
  const lineWeight = weightFromVector(vector);

  let l = null;
  for (let i = 0; i < segments; i++) {
    const w = subdivider(i / segments, fourPoints[0], fourPoints[1],
      fourPoints[2],fourPoints[3]);
    this._bezier.push(w);
  }
}


class SignatureModel extends EventEmitter {
  _doneLines = [];
  _bezier = [];

  _curPoints = [];
  _lastPoint = null;

  // TODO: Add method to export to Svg.

  _addPoint = (point) => {

  }



  onBegan = (point) => {
    if (this._curPoints.length > 0) {
      this._doneLines.push(this._curPoints);
      this._curPoints = [];
    }
    this._addPoint(point);
  };

  onMoved = (point) => {
    this._addPoint(point);
    // this._curPoints.push(point);

    // if (this._curPoints.length == 4) {
    //   const points = [];

    //   console.log('Controll points', this._curPoints);
    //   const s = subdivisionSegments(this._curPoints[0],
    //     this._curPoints[1], this._curPoints[2], this._curPoints[3]);

    //   const vector = Vector2.sub(this._curPoints[3], this._curPoints[0]);
    //   const lineWeight = weightFromVector(vector);


    //   let l = null;
    //   for (let i = 0; i < s; i++) {
    //     const w = subdivider(i / s, this._curPoints[0],
    //       this._curPoints[1], this._curPoints[2],this._curPoints[3]);
    //     if (l === null) {
    //       l = w;
    //     }
    //     w.w =  lineWeight;
    //     this._bezier.push(w);
    //   }
    //   this.emit('onDraw',this._bezier);

    //   this._curPoints = [];
    // }
  };

  onEnded = (point) => {
  };
}

export default SignatureModel;