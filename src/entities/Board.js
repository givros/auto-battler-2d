(function (AB) {
  class Board {
    constructor() {
      const config = AB.GAME_CONFIG.board;
      this.cols = config.cols;
      this.rows = config.rows;
      this.playerStartRow = config.playerStartRow;
      this.tileSize = config.tileSize;
      this.offsetX = config.offsetX;
      this.offsetY = config.offsetY;
      this.tiles = [];
      this.occupancy = new Map();

      for (let y = 0; y < this.rows; y += 1) {
        for (let x = 0; x < this.cols; x += 1) {
          this.tiles.push(new AB.Tile(x, y, this.isPlayerTile(x, y)));
        }
      }
    }

    key(x, y) {
      return `${x},${y}`;
    }

    isInside(x, y) {
      return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
    }

    isPlayerTile(x, y) {
      return this.isInside(x, y) && y >= this.playerStartRow;
    }

    isEnemyTile(x, y) {
      return this.isInside(x, y) && y < this.playerStartRow;
    }

    isOccupied(x, y) {
      return this.occupancy.has(this.key(x, y));
    }

    getUnitAt(x, y) {
      return this.occupancy.get(this.key(x, y)) || null;
    }

    tileToPixel(x, y) {
      return {
        x: this.offsetX + x * this.tileSize + this.tileSize / 2,
        y: this.offsetY + y * this.tileSize + this.tileSize / 2,
      };
    }

    pixelToTile(x, y) {
      const tileX = Math.floor((x - this.offsetX) / this.tileSize);
      const tileY = Math.floor((y - this.offsetY) / this.tileSize);
      return this.isInside(tileX, tileY) ? { x: tileX, y: tileY } : null;
    }

    placeUnit(unit, x, y) {
      if (!this.isInside(x, y) || this.isOccupied(x, y)) {
        return false;
      }
      this.occupancy.set(this.key(x, y), unit);
      unit.setBoardPosition(x, y, this.tileToPixel(x, y));
      return true;
    }

    moveUnit(unit, x, y) {
      if (!this.isInside(x, y) || this.isOccupied(x, y)) {
        return false;
      }
      this.occupancy.delete(this.key(unit.gridX, unit.gridY));
      this.occupancy.set(this.key(x, y), unit);
      unit.gridX = x;
      unit.gridY = y;
      unit.setTargetPosition(this.tileToPixel(x, y));
      return true;
    }

    removeUnit(unit) {
      if (unit.gridX !== null && unit.gridY !== null) {
        this.occupancy.delete(this.key(unit.gridX, unit.gridY));
      }
      unit.gridX = null;
      unit.gridY = null;
    }

    rebuildOccupancy(units) {
      this.occupancy.clear();
      units.filter((unit) => !unit.isDead).forEach((unit) => {
        this.occupancy.set(this.key(unit.gridX, unit.gridY), unit);
      });
    }
  }

  AB.Board = Board;
})(window.AutoBattler = window.AutoBattler || {});
