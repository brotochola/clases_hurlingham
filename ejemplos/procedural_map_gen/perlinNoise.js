/**
 * Simple Perlin noise implementation
 */
class PerlinNoise {
  constructor(seed = Math.random()) {
    this.seed = seed;
    this.gradients = {};
    this.memory = {};
  }

  // Generate a pseudo-random gradient vector
  randomGradient(ix, iy) {
    const key = `${ix},${iy}`;
    if (this.gradients[key]) {
      return this.gradients[key];
    }

    // Use a simple hash function based on coordinates and seed
    const hash =
      (ix * 374761393 + iy * 668265263 + this.seed * 1000) % 2147483647;
    const angle = (hash / 2147483647) * 2 * Math.PI;

    const gradient = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    this.gradients[key] = gradient;
    return gradient;
  }

  // Compute dot product of distance and gradient vectors
  dotGridGradient(ix, iy, x, y) {
    const gradient = this.randomGradient(ix, iy);
    const dx = x - ix;
    const dy = y - iy;
    return dx * gradient.x + dy * gradient.y;
  }

  // Interpolate between a0 and a1 with weight w
  interpolate(a0, a1, w) {
    return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0;
  }

  // Generate Perlin noise value at coordinates (x, y)
  noise(x, y) {
    const key = `${x},${y}`;
    if (this.memory[key] !== undefined) {
      return this.memory[key];
    }

    const x0 = Math.floor(x);
    const x1 = x0 + 1;
    const y0 = Math.floor(y);
    const y1 = y0 + 1;

    const sx = x - x0;
    const sy = y - y0;

    const n0 = this.dotGridGradient(x0, y0, x, y);
    const n1 = this.dotGridGradient(x1, y0, x, y);
    const ix0 = this.interpolate(n0, n1, sx);

    const n2 = this.dotGridGradient(x0, y1, x, y);
    const n3 = this.dotGridGradient(x1, y1, x, y);
    const ix1 = this.interpolate(n2, n3, sx);

    const value = this.interpolate(ix0, ix1, sy);

    // Normalize to 0-1 range
    const normalized = (value + 1) / 2;
    this.memory[key] = Math.max(0, Math.min(1, normalized));

    return this.memory[key];
  }
}
