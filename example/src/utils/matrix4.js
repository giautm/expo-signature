// @flow

export const matrixOrtho = (
  out: ArrayBuffer,
  left: number,
  right: number,
  bottom: number,
  top: number,
  nearZ: number,
  farZ: number
): Float32Array => {
  const ral = right + left;
  const rsl = right - left;
  const tab = top + bottom;
  const tsb = top - bottom;
  const fan = farZ + nearZ;
  const fsn = farZ - nearZ;

  out[0] = 2.0 / rsl;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  out[4] = 0.0;
  out[5] = 2.0 / tsb;
  out[6] = 0.0;
  out[7] = 0.0;
  out[8] = 0.0;
  out[9] = 0.0;
  out[10] = -2.0 / fsn;
  out[11] = 0.0;
  out[12] = -ral / rsl;
  out[13] = -tab / tsb;
  out[14] = -fan / fsn;
  out[15] = 1.0;

  return out;
}

export default {
  ortho: matrixOrtho,
};