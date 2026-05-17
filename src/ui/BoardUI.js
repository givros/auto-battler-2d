(function (AB) {
  class BoardUI {
    constructor(canvas, game, tooltip) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.game = game;
      this.tooltip = tooltip;
      this.highlightTiles = [];
      this.hoverTile = null;
      this.dragUnit = null;
      this.bindTooltip();
      this.bindResize();
    }

    bindTooltip() {
      this.canvas.addEventListener("pointermove", (event) => {
        if (this.dragUnit) {
          return;
        }
        const tile = this.eventToTile(event);
        const unit = tile ? this.game.board.getUnitAt(tile.x, tile.y) : null;
        if (!unit) {
          this.tooltip.hide();
          return;
        }
        const config = unit.baseStats;
        this.tooltip.show(
          `<strong>${unit.name} ${"★".repeat(unit.starLevel)}</strong><br>
          ${config.className} · ${config.origin}<br>
          HP ${Math.round(unit.currentHp || config.hp)} / ${Math.round(unit.maxHp || config.hp)} · Mana ${Math.round(unit.currentMana || 0)} / ${unit.maxMana}<br>
          <em>${config.ability.name}</em>: ${config.ability.description}`,
          event.clientX,
          event.clientY,
        );
      });
      this.canvas.addEventListener("pointerleave", () => this.tooltip.hide());
    }

    eventToTile(event) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      return this.game.board.pixelToTile(x, y);
    }

    setHighlights(tiles) {
      this.highlightTiles = tiles;
    }

    clearDragState() {
      this.highlightTiles = [];
      this.hoverTile = null;
      this.dragUnit = null;
    }

    bindResize() {
      const resize = () => this.fitCanvasToStage();
      if (typeof ResizeObserver !== "undefined") {
        this.resizeObserver = new ResizeObserver(resize);
        this.resizeObserver.observe(this.canvas.parentElement);
      } else {
        window.addEventListener("resize", resize);
      }
      resize();
    }

    fitCanvasToStage() {
      const stage = this.canvas.parentElement;
      if (!stage) {
        return;
      }
      const ratio = this.canvas.width / this.canvas.height;
      const widthLimit = Math.max(1, stage.clientWidth);
      const heightLimit = Math.max(1, stage.clientHeight);
      let displayWidth = widthLimit;
      let displayHeight = displayWidth / ratio;

      if (displayHeight > heightLimit) {
        displayHeight = heightLimit;
        displayWidth = displayHeight * ratio;
      }

      this.canvas.style.width = `${Math.floor(displayWidth)}px`;
      this.canvas.style.height = `${Math.floor(displayHeight)}px`;
    }

    render() {
      const { ctx, canvas } = this;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      AB.GeneratedAssets.drawArenaBackdrop(
        ctx,
        canvas.width,
        canvas.height,
        this.game.assets.backgrounds.arena,
      );
      this.drawBoard();
      this.drawUnits();
      this.drawEffects();
      this.drawDamageNumbers();
    }

    drawBoard() {
      const { board } = this.game;
      board.tiles.forEach((tile) => {
        const x = board.offsetX + tile.x * board.tileSize;
        const y = board.offsetY + tile.y * board.tileSize;
        const highlighted = this.highlightTiles.some((item) => item.x === tile.x && item.y === tile.y);
        AB.GeneratedAssets.drawTile(
          this.ctx,
          x,
          y,
          board.tileSize,
          tile.isPlayerSide,
          highlighted ? 1 : 0,
        );
      });
      this.drawSideBands();

      if (this.hoverTile && this.highlightTiles.some((tile) => tile.x === this.hoverTile.x && tile.y === this.hoverTile.y)) {
        const x = board.offsetX + this.hoverTile.x * board.tileSize;
        const y = board.offsetY + this.hoverTile.y * board.tileSize;
        this.ctx.strokeStyle = "#d7ff9d";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x + 3, y + 3, board.tileSize - 8, board.tileSize - 8);
      }
    }

    drawUnits() {
      const units = this.game.phase === "Combat"
        ? this.game.player.boardUnits.concat(this.game.ai.boardUnits)
        : this.game.player.boardUnits;
      units
        .slice()
        .sort((left, right) => left.gridY - right.gridY || left.gridX - right.gridX)
        .forEach((unit) => this.drawUnit(unit));
    }

    drawUnit(unit) {
      this.drawTeamMarker(unit);
      const view = unit.team === "player" ? "back" : "front";
      const sprite = this.game.assets.sprites[unit.unitId][view][unit.state];
      const scale = Math.min(1, 104 / sprite.height);
      const width = sprite.width * scale;
      const height = sprite.height * scale;
      this.ctx.drawImage(sprite, unit.renderX - width / 2, unit.renderY + 18 - height, width, height);

      if (!unit.isDead) {
        this.drawBars(unit);
        this.ctx.fillStyle = "#ffd66c";
        this.ctx.font = "16px Georgia";
        this.ctx.textAlign = "center";
        this.ctx.fillText("★".repeat(unit.starLevel), unit.renderX, unit.renderY - 46);
      }
    }

    drawBars(unit) {
      const x = unit.renderX - 28;
      const hpY = unit.renderY - 38;
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      this.ctx.fillRect(x, hpY, 56, 7);
      this.ctx.fillStyle = unit.team === "player" ? "#57d477" : "#f17066";
      this.ctx.fillRect(x, hpY, 56 * (unit.currentHp / unit.maxHp), 7);
      if (unit.shield > 0) {
        this.ctx.fillStyle = "#88e8ff";
        this.ctx.fillRect(x, hpY - 4, Math.min(56, 56 * (unit.shield / unit.maxHp)), 3);
      }
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      this.ctx.fillRect(x, hpY + 10, 56, 5);
      this.ctx.fillStyle = "#5bc7ff";
      this.ctx.fillRect(x, hpY + 10, 56 * (unit.currentMana / unit.maxMana), 5);
    }

    drawSideBands() {
      const { board } = this.game;
      const width = board.cols * board.tileSize - 2;
      const enemyY = board.offsetY;
      const playerY = board.offsetY + board.playerStartRow * board.tileSize;

      this.ctx.fillStyle = "rgba(202, 72, 72, 0.08)";
      this.ctx.fillRect(board.offsetX, enemyY, width, board.playerStartRow * board.tileSize - 2);
      this.ctx.fillStyle = "rgba(79, 175, 255, 0.08)";
      this.ctx.fillRect(
        board.offsetX,
        playerY,
        width,
        (board.rows - board.playerStartRow) * board.tileSize - 2,
      );

      this.ctx.save();
      this.ctx.font = "bold 13px Trebuchet MS";
      this.ctx.textAlign = "left";
      this.ctx.fillStyle = "rgba(255, 181, 181, 0.88)";
      this.ctx.fillText("ENEMY SIDE", board.offsetX + 12, board.offsetY + 22);
      this.ctx.fillStyle = "rgba(178, 224, 255, 0.92)";
      this.ctx.fillText("YOUR SIDE", board.offsetX + 12, playerY + 22);
      this.ctx.restore();
    }

    drawTeamMarker(unit) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.ellipse(unit.renderX, unit.renderY + 15, 34, 12, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = unit.team === "player"
        ? "rgba(85, 200, 255, 0.2)"
        : "rgba(243, 109, 98, 0.24)";
      this.ctx.fill();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = unit.team === "player" ? "#55c8ff" : "#f36d62";
      this.ctx.stroke();
      this.ctx.restore();
    }

    drawEffects() {
      this.game.combat.effects.forEach((effect) => {
        if (effect.type === "attack") {
          AB.GeneratedAssets.drawAttackFx(this.ctx, effect);
        } else {
          AB.GeneratedAssets.drawSpellFx(this.ctx, effect);
        }
      });
    }

    drawDamageNumbers() {
      this.game.combat.damageNumbers.forEach((number) => {
        this.ctx.save();
        this.ctx.globalAlpha = number.life / number.maxLife;
        this.ctx.fillStyle = number.color;
        this.ctx.font = "bold 18px Trebuchet MS";
        this.ctx.textAlign = "center";
        this.ctx.fillText(number.value, number.x, number.y);
        this.ctx.restore();
      });
    }
  }

  AB.BoardUI = BoardUI;
})(window.AutoBattler = window.AutoBattler || {});
