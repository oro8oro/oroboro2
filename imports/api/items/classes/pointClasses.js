// Point classes: main points, attractors, first M point, controlls

export const Point = class Point {
  constructor({ x, y }) {
    this._x = x;
    this._y = y;
    this._selected = null;
  }
};