(function (AB) {
  class DragDropSystem {
    constructor(game, boardUI, benchUI) {
      this.game = game;
      this.boardUI = boardUI;
      this.benchUI = benchUI;
      this.drag = null;
      this.bind();
    }

    bind() {
      this.boardUI.canvas.addEventListener("pointerdown", (event) => this.onBoardPointerDown(event));
      window.addEventListener("pointermove", (event) => this.onPointerMove(event));
      window.addEventListener("pointerup", (event) => this.onPointerUp(event));
    }

    beginBenchDrag(unit, benchIndex, event) {
      if (!this.game.canPlaceUnits()) {
        this.game.notifyPhaseLocked();
        return;
      }
      this.drag = {
        unit,
        from: "bench",
        benchIndex,
      };
      this.boardUI.setHighlights(this.game.getValidPlayerTiles());
      this.onPointerMove(event);
    }

    onBoardPointerDown(event) {
      if (!this.game.canPlaceUnits()) {
        return;
      }
      const tile = this.boardUI.eventToTile(event);
      if (!tile) {
        return;
      }
      const unit = this.game.board.getUnitAt(tile.x, tile.y);
      if (!unit || unit.team !== "player") {
        return;
      }
      this.drag = {
        unit,
        from: "board",
        original: { x: unit.gridX, y: unit.gridY },
      };
      this.game.board.removeUnit(unit);
      this.boardUI.setHighlights(this.game.getValidPlayerTiles());
    }

    onPointerMove(event) {
      if (!this.drag) {
        return;
      }
      const tile = this.boardUI.eventToTile(event);
      this.boardUI.hoverTile = tile;
      this.boardUI.dragUnit = this.drag.unit;
    }

    onPointerUp(event) {
      if (!this.drag) {
        return;
      }
      const tile = this.boardUI.eventToTile(event);
      const placed = tile && this.game.tryPlaceDraggedUnit(this.drag, tile);
      if (!placed && this.drag.from === "board") {
        this.game.board.placeUnit(this.drag.unit, this.drag.original.x, this.drag.original.y);
      }
      if (!placed && this.drag.from === "bench") {
        this.game.toast("Invalid placement.", "bad");
      }
      this.drag = null;
      this.boardUI.clearDragState();
      this.game.refreshUI();
    }
  }

  AB.DragDropSystem = DragDropSystem;
})(window.AutoBattler = window.AutoBattler || {});
