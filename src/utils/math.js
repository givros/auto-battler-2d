(function (AB) {
  AB.math = {
    clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    },

    lerp(start, end, amount) {
      return start + (end - start) * amount;
    },

    distanceManhattan(a, b) {
      return Math.abs(a.gridX - b.gridX) + Math.abs(a.gridY - b.gridY);
    },

    distanceTiles(a, b) {
      return Math.hypot(a.gridX - b.gridX, a.gridY - b.gridY);
    },
  };
})(window.AutoBattler = window.AutoBattler || {});
