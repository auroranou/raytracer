export class Vector {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static add(a: Vector, b: Vector): Vector {
    return new Vector(
      a.x + b.x,
      a.y + b.y,
      a.z + b.z
    );
  }
}