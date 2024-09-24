
class Vector {
  constructor(t, e = 0, i = 0) {
    (this.x = t), (this.y = e), (this.z = i);
  }
  static up() {
    return new Vector(0, 1, 0);
  }
  static down() {
    return new Vector(0, -1, 0);
  }
  static left() {
    return new Vector(-1, 0, 0);
  }
  static right() {
    return new Vector(1, 0, 0);
  }
  static forward() {
    return new Vector(0, 0, 1);
  }
  static back() {
    return new Vector(0, 0, -1);
  }
  static fromAngle(t, e = 1) {
    return new Vector(e * Math.cos(t), Math.sin(t), 0);
  }
  static fromAngles(t, e, i = 1) {
    const s = Math.cos(e),
      r = Math.sin(e),
      n = Math.cos(t),
      h = Math.sin(t);
    return new Vector(i * h * r, -i * n, i * h * s);
  }
  static random2D() {
    return this.fromAngle(Math.random() * constants.TWO_PI);
  }
  static random3D() {
    const t = Math.random() * constants.TWO_PI,
      e = 2 * Math.random() - 1,
      i = Math.sqrt(1 - e * e),
      s = i * Math.cos(t),
      r = i * Math.sin(t);
    return new Vector(s, r, e);
  }
  static add(t, e, i) {
    return (
      i
        ? i.set(t)
        : ((i = t.copy()),
          3 === arguments.length &&
            console.warn(
              "The target parameter is undefined, it should be of type Vector",
              "Vector.add"
            )),
      i.add(e),
      i
    );
  }
  static rem(t, e) {
    if (t instanceof Vector && e instanceof Vector) {
      let i = t.copy();
      return i.rem(e), i;
    }
  }
  static sub(t, e, i) {
    return (
      i
        ? i.set(t)
        : ((i = t.copy()),
          3 === arguments.length &&
            console.warn(
              "The target parameter is undefined, it should be of type Vector",
              "Vector.sub"
            )),
      i.sub(e),
      i
    );
  }
  static mult(t, e, i) {
    return (
      i
        ? i.set(t)
        : ((i = t.copy()),
          3 === arguments.length &&
            console.warn(
              "The target parameter is undefined, it should be of type Vector",
              "Vector.mult"
            )),
      i.mult(e),
      i
    );
  }
  static rotate(t, e, i) {
    return (
      2 === arguments.length
        ? (i = t.copy())
        : (i instanceof Vector ||
            console.warn(
              "The target parameter should be of type Vector",
              "Vector.rotate"
            ),
          i.set(t)),
      i.rotate(e),
      i
    );
  }
  static div(t, e, i) {
    return (
      i
        ? i.set(t)
        : ((i = t.copy()),
          3 === arguments.length &&
            console.warn(
              "The target parameter is undefined, it should be of type Vector",
              "Vector.div"
            )),
      i.div(e),
      i
    );
  }
  static dot(t, e) {
    return t.dot(e);
  }
  static cross(t, e) {
    return t.cross(e);
  }
  static dist(t, e) {
    return t.dist(e);
  }
  static lerp(t, e, i, s) {
    return (
      s
        ? s.set(t)
        : ((s = t.copy()),
          4 === arguments.length &&
            console.warn(
              "The target parameter is undefined, it should be of type Vector",
              "Vector.lerp"
            )),
      s.lerp(e, i),
      s
    );
  }
  static mag(t) {
    const e = t.x,
      i = t.y,
      s = t.z,
      r = e * e + i * i + s * s;
    return Math.sqrt(r);
  }
  static normalize(t, e) {
    return (
      arguments.length < 2
        ? (e = t.copy())
        : (e instanceof Vector ||
            console.warn(
              "The target parameter should be of type Vector",
              "Vector.normalize"
            ),
          e.set(t)),
      e.normalize()
    );
  }
  calculateRemainder2D(t, e) {
    return (
      0 !== t && (this.x = this.x % t), 0 !== e && (this.y = this.y % e), this
    );
  }
  calculateRemainder3D(t, e, i) {
    return (
      0 !== t && (this.x = this.x % t),
      0 !== e && (this.y = this.y % e),
      0 !== i && (this.z = this.z % i),
      this
    );
  }
  toString() {
    return `Vector Object: [${this.x}, ${this.y}, ${this.z}]`;
  }
  set(t = 0, e = 0, i = 0) {
    return t instanceof Vector
      ? ((this.x = t.x), (this.y = t.y), (this.z = t.z), this)
      : t instanceof Array
      ? ((this.x = t[0]), (this.y = t[1]), (this.z = t[2]), this)
      : ((this.x = t), (this.y = e), (this.z = i), this);
  }
  copy() {
    return new Vector(this.x, this.y, this.z);
  }
  add(t = 0, e = 0, i = 0) {
    return t instanceof Vector
      ? ((this.x += t.x), (this.y += t.y), (this.z += t.z), this)
      : t instanceof Array
      ? ((this.x += t[0]), (this.y += t[1]), (this.z += t[2]), this)
      : ((this.x += t), (this.y += e), (this.z += i), this);
  }
  rem(t, e = 0, i = 0) {
    if (t instanceof Vector) {
      if (
        Number.isFinite(t.x) &&
        Number.isFinite(t.y) &&
        Number.isFinite(t.z)
      ) {
        const e = parseFloat(`${t.x}`),
          i = parseFloat(`${t.y}`),
          s = parseFloat(`${t.z}`);
        this.calculateRemainder3D(e, i, s);
      }
    } else if (t instanceof Array)
      t.every((t) => Number.isFinite(t)) &&
        (2 === t.length && this.calculateRemainder2D(t[0], t[1]),
        3 === t.length && this.calculateRemainder3D(t[0], t[1], t[2]));
    else if (1 === arguments.length) {
      if (Number.isFinite(arguments[0]) && 0 !== arguments[0])
        return (
          (this.x = this.x % arguments[0]),
          (this.y = this.y % arguments[0]),
          (this.z = this.z % arguments[0]),
          this
        );
    } else if (2 === arguments.length) {
      const t = [...arguments];
      t.every((t) => Number.isFinite(t)) &&
        2 === t.length &&
        this.calculateRemainder2D(t[0], t[1]);
    } else if (3 === arguments.length) {
      const t = [...arguments];
      t.every((t) => Number.isFinite(t)) &&
        3 === t.length &&
        this.calculateRemainder3D(t[0], t[1], t[2]);
    }
  }
  sub(t, e, i) {
    return t instanceof Vector
      ? ((this.x -= t.x), (this.y -= t.y), (this.z -= t.z), this)
      : t instanceof Array
      ? ((this.x -= t[0]), (this.y -= t[1]), (this.z -= t[2]), this)
      : ((this.x -= t), (this.y -= e || 0), (this.z -= i || 0), this);
  }
  mult(t, e, i) {
    if (t instanceof Vector)
      return (
        Number.isFinite(t.x) &&
        Number.isFinite(t.y) &&
        Number.isFinite(t.z) &&
        "number" == typeof t.x &&
        "number" == typeof t.y &&
        "number" == typeof t.z
          ? ((this.x *= t.x), (this.y *= t.y), (this.z *= t.z))
          : console.warn(
              "Vector.mult:",
              "x contains components that are either undefined or not finite numbers"
            ),
        this
      );
    if (t instanceof Array)
      return (
        t.every((t) => Number.isFinite(t)) &&
        t.every((t) => "number" == typeof t)
          ? 1 === t.length
            ? ((this.x *= t[0]), (this.y *= t[0]), (this.z *= t[0]))
            : 2 === t.length
            ? ((this.x *= t[0]), (this.y *= t[1]))
            : 3 === t.length &&
              ((this.x *= t[0]), (this.y *= t[1]), (this.z *= t[2]))
          : console.warn(
              "Vector.mult:",
              "x contains elements that are either undefined or not finite numbers"
            ),
        this
      );
    const s = [...arguments];
    return (
      s.every((t) => Number.isFinite(t)) && s.every((t) => "number" == typeof t)
        ? (1 === arguments.length &&
            ((this.x *= t), (this.y *= t), (this.z *= t)),
          2 === arguments.length && ((this.x *= t), (this.y *= e || 0)),
          3 === arguments.length &&
            ((this.x *= t), (this.y *= e || 0), (this.z *= i || 0)))
        : console.warn(
            "Vector.mult:",
            "x, y, or z arguments are either undefined or not a finite number"
          ),
      this
    );
  }
  div(t = 0, e = 0, i = 0) {
    if (t instanceof Vector) {
      if (
        Number.isFinite(t.x) &&
        Number.isFinite(t.y) &&
        Number.isFinite(t.z) &&
        "number" == typeof t.x &&
        "number" == typeof t.y &&
        "number" == typeof t.z
      ) {
        if (0 === t.x || 0 === t.y || 0 === t.z)
          return console.warn("Vector.div:", "divide by 0"), this;
        (this.x /= t.x), (this.y /= t.y), (this.z /= t.z);
      } else
        console.warn(
          "Vector.div:",
          "x contains components that are either undefined or not finite numbers"
        );
      return this;
    }
    if (t instanceof Array) {
      if (
        t.every((t) => Number.isFinite(t)) &&
        t.every((t) => "number" == typeof t)
      ) {
        if (t.some((t) => 0 === t))
          return console.warn("Vector.div:", "divide by 0"), this;
        1 === t.length
          ? ((this.x /= t[0]), (this.y /= t[0]), (this.z /= t[0]))
          : 2 === t.length
          ? ((this.x /= t[0]), (this.y /= t[1]))
          : 3 === t.length &&
            ((this.x /= t[0]), (this.y /= t[1]), (this.z /= t[2]));
      } else
        console.warn(
          "Vector.div:",
          "x contains components that are either undefined or not finite numbers"
        );
      return this;
    }
    const s = [...arguments];
    if (
      s.every((t) => Number.isFinite(t)) &&
      s.every((t) => "number" == typeof t)
    ) {
      if (s.some((t) => 0 === t))
        return console.warn("Vector.div:", "divide by 0"), this;
      1 === arguments.length && ((this.x /= t), (this.y /= t), (this.z /= t)),
        2 === arguments.length && ((this.x /= t), (this.y /= e)),
        3 === arguments.length && ((this.x /= t), (this.y /= e), (this.z /= i));
    } else
      console.warn(
        "Vector.div:",
        "x, y, or z arguments are either undefined or not a finite number"
      );
    return this;
  }
  mag() {
    return Math.sqrt(this.magSq());
  }
  magSq() {
    const t = this.x,
      e = this.y,
      i = this.z;
    return t * t + e * e + i * i;
  }
  dot(t = 0, e = 0, i = 0) {
    return t instanceof Vector
      ? this.dot(t.x, t.y, t.z)
      : t instanceof Array
      ? this.dot(t[0], t[1], t[2])
      : this.x * (t || 0) + this.y * (e || 0) + this.z * (i || 0);
  }
  cross(t) {
    const e = this.y * t.z - this.z * t.y,
      i = this.z * t.x - this.x * t.z,
      s = this.x * t.y - this.y * t.x;
    return new Vector(e, i, s);
  }
  dist(t) {
    return t.copy().sub(this).mag();
  }
  normalize() {
    const t = this.mag();
    return 0 !== t && this.mult(1 / t), this;
  }
  limit(t) {
    const e = this.magSq();
    return e > t * t && this.div(Math.sqrt(e)).mult(t), this;
  }
  setMag(t) {
    return this.normalize().mult(t);
  }
  heading() {
    return Math.atan2(this.y, this.x);
  }
  setHeading(t) {
    let e = this.mag();
    return (this.x = e * Math.cos(t)), (this.y = e * Math.sin(t)), this;
  }
  rotate(t) {
    let e = this.heading() + t;
    const i = this.mag();
    return (this.x = Math.cos(e) * i), (this.y = Math.sin(e) * i), this;
  }
  angleBetween(t) {
    const e = this.dot(t) / (this.mag() * t.mag());
    let i;
    return (
      (i = Math.acos(Math.min(1, Math.max(-1, e)))),
      (i *= Math.sign(this.cross(t).z || 1)),
      i
    );
  }
  lerp(t = 0, e = 0, i, s) {
    return t instanceof Vector
      ? this.lerp(t.x, t.y, t.z, e)
      : t instanceof Array
      ? this.lerp(t[0], t[1], t[2], e)
      : ((s = s || 0),
        (i = i || 0),
        (this.x += (t - this.x) * s || 0),
        (this.y += (e - this.y) * s || 0),
        (this.z += (i - this.z) * s || 0),
        this);
  }
  reflect(t) {
    return t.normalize(), this.sub(t.mult(2 * this.dot(t)));
  }
  array() {
    return [this.x, this.y, this.x];
  }
  equals(t = 0, e = 0, i = 0) {
    let s, r, n;
    return (
      t instanceof Vector
        ? ((s = t.x), (r = t.y), (n = t.z))
        : t instanceof Array
        ? ((s = t[0]), (r = t[1]), (n = t[2]))
        : ((s = t), (r = e), (n = i)),
      this.x === s && this.y === r && this.z === n
    );
  }
}
function createVector(t = 0, e = 0, i = 0) {
  return new Vector(t, e, i);
}
