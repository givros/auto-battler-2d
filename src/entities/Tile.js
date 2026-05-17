(function (AB) {
  class Tile {
    constructor(x, y, isPlayerSide) {
      this.x = x;
      this.y = y;
      this.isPlayerSide = isPlayerSide;
    }
  }

  AB.Tile = Tile;
})(window.AutoBattler = window.AutoBattler || {});
