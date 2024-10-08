var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function (h) {
  var p = 0;
  return function () {
    return p < h.length ? { done: !1, value: h[p++] } : { done: !0 };
  };
};
$jscomp.arrayIterator = function (h) {
  return { next: $jscomp.arrayIteratorImpl(h) };
};
$jscomp.makeIterator = function (h) {
  var p = "undefined" != typeof Symbol && Symbol.iterator && h[Symbol.iterator];
  return p ? p.call(h) : $jscomp.arrayIterator(h);
};
$jscomp.arrayFromIterator = function (h) {
  for (var p, A = []; !(p = h.next()).done; ) A.push(p.value);
  return A;
};
$jscomp.arrayFromIterable = function (h) {
  return h instanceof Array
    ? h
    : $jscomp.arrayFromIterator($jscomp.makeIterator(h));
};
var concaveHull = (function () {
  function h(a, k) {
    var d = Math.max(k, 3);
    if (d >= a.length) return null;
    var f = [];
    for (var c = {}, e = 0, b = a.length; e < b; e++) {
      var q = JSON.stringify(a[e]);
      c[q] || (f.push(a[e]), (c[q] = !0));
    }
    if (3 > f.length) return null;
    if (3 == f.length) return f;
    d = Math.min(d, f.length - 1);
    c = G(f, 1);
    b = c.indexOf(Math.max.apply(Math, $jscomp.arrayFromIterable(c)));
    e = f[b];
    c = [];
    c.push(f[b]);
    var g = e;
    f = p(f, e);
    var n = Math.PI;
    b = 2;
    for (q = b + d; (!C(g, e) || 2 == b) && 0 < f.length; ) {
      b == q && f.push(e);
      var t = A(f, g, d);
      g = H(t, g, n);
      var l = !0;
      for (n = 0; 1 == l && n < g.length; ) {
        n++;
        t = C(g[n - 1], e) ? 1 : 0;
        var u = 2;
        for (l = !1; 0 == l && u < c.length - t; ) {
          var m = [c[b - 2], g[n - 1]],
            r = [c[b - 2 - u], c[b - 1 - u]];
          l = m[0][0];
          var w = m[0][1],
            x = r[0][0],
            y = r[0][1],
            z = m[1][0] - l;
          m = m[1][1] - w;
          var v = r[1][0] - x,
            D = r[1][1] - y;
          r = z * D - v * m;
          if (0 == r) l = !1;
          else {
            var B = 0 < r;
            x = l - x;
            var E = w - y;
            y = z * E - m * x;
            0 > y == B
              ? (l = !1)
              : ((v = v * E - D * x),
                0 > v == B || y > r == B || v > r == B
                  ? (l = !1)
                  : ((v /= r), (l = { x: l + v * z, y: w + v * m })));
          }
          l = !1 !== l ? !0 : !1;
          u++;
        }
      }
      if (1 == l) return h(a, d + 1);
      g = g[n - 1];
      c.push(g);
      n = F(c[b - 2], c[b - 1]);
      f = p(f, g);
      b++;
    }
    b = !0;
    for (e = f.length - 1; 1 == b && 0 <= e; ) {
      g = f[e];
      t = b = void 0;
      q = g[0];
      g = g[1];
      n = !1;
      void 0 === b && (b = 0);
      void 0 === t && (t = c.length);
      t -= b;
      u = 0;
      for (m = t - 1; u < t; m = u++)
        (l = c[u + b][0]),
          (w = c[u + b][1]),
          (z = c[m + b][0]),
          (m = c[m + b][1]),
          w > g !== m > g && q < ((z - l) * (g - w)) / (m - w) + l && (n = !n);
      b = n;
      e--;
    }
    return 0 == b ? h(a, d + 1) : c;
  }
  function p(a, k) {
    for (var d = 0; d < a.length; d++) if (C(a[d], k)) return a.splice(d, 1), a;
  }
  function A(a, k, d) {
    for (var f = [], c = [], e = 0; e < a.length; e++)
      c.push({ id: e, point: a[e], distance: I(a[e], k) });
    c.sort(function (b, q) {
      return b.distance > q.distance ? 1 : -1;
    });
    d = Math.min(d, c.length);
    for (a = 0; a < d; a++) f.push(c[a].point);
    return f;
  }
  function H(a, k, d) {
    for (var f = [], c = [], e = 0; e < a.length; e++) {
      var b = { id: e, point: a[e], angle: d - F(a[e], k) };
      0 > b.angle && (b.angle += 2 * Math.PI);
      b.degrees = ((180 / Math.PI) * b.angle).toFixed(2);
      c.push(b);
    }
    c.sort(function (q, g) {
      return q.angle > g.angle ? -1 : 1;
    });
    for (a = 0; a < c.length; a++) f.push(c[a].point);
    return f;
  }
  function F(a, k) {
    var d = Math.atan2(k[1] - a[1], k[0] - a[0]);
    d = Math.PI - d;
    0 > d && (d += 2 * Math.PI);
    return d;
  }
  function G(a, k) {
    return a.map(function (d) {
      return d[k];
    });
  }
  function C(a, k) {
    return a[0] === k[0] && a[1] === k[1] ? !0 : !1;
  }
  function I(a, k) {
    return Math.sqrt(Math.pow(k[0] - a[0], 2) + Math.pow(k[1] - a[1], 2));
  }
  return { calculate: h };
})();
"object" === typeof exports && (module.exports = { concaveHull: concaveHull });
