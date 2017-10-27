import Vector2 from './utils/vector2';

const approxLength = (a, p1, p2, b) => Vector2.lengthArray([
  Vector2.sub(a, p1),
  Vector2.sub(p1, p2),
  Vector2.sub(p2, b),
]);

export const subdivisionSegments = (a, p1, p2, b) => {
  const segments = approxLength(a, p1, p2, b) / 20.0;
  return Math.ceil(Math.sqrt(segments * segments * 0.6 + 225.0));
}

export const subdivider = (t, a, p1, p2, b) => {
  const nt = 1.0 - t;

  const point = Vector2.addArray([
    Vector2.multiplyScalar(a, nt * nt * nt),
    Vector2.multiplyScalar(p1, nt * nt * t * 3.0),
    Vector2.multiplyScalar(p2, t * t * nt * 3.0),
    Vector2.multiplyScalar(b, t * t * t),
  ]);

  const tangent = Vector2.addArray([
    Vector2.multiplyScalar(a, nt * nt * -3.0),
    Vector2.multiplyScalar(p1, 3.0 * (1.0 - 4.0 * t + t * t * 3.0)),
    Vector2.multiplyScalar(p2, 3.0 * (2.0 * t - t * t * 3.0)),
    Vector2.multiplyScalar(b, t * t * 3.0)
  ]);

  const n = Vector2.normalize(Vector2.perpendicular(tangent));
  return { p: point, n };
}

export const addArcWithCenter = (center, radius, startAngle, endAngle, segments) => {
  const angle = startAngle * Math.PI / 180.0;
  const angelDelta = (endAngle * Math.PI / 180.0) / segments;
  const points = [];
  for (let i = 0; i <= segments; i++) {
    points.push(Vector2.add(center, [
      radius * Math.cos(angle + i * angelDelta),
      radius * Math.sin(angle + i * angelDelta),
    ]));
  }

  return points;
};

class BezierPath {
}


type Line = {
  startPoint: Vector2;
  endPoint: Vector2;
};

const _linePerpendicularToLine = (vector: Vector2, point: Vector2, weight: number): Line => {
  const halfWeight = weight * 0.5;

  const perpendicular = Vector.normalize(Vector.perpendicular(vector));

  const startPoint = Vector.add(point,
    Vector.multiplyScalar(perpendicular, +halfWeight));
  const endPoint = Vector.add(point, 
    Vector.multiplyScalar(perpendicular, -halfWeight));

  return { startPoint, endPoint };
}