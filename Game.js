(function (AB) {
  class Game {
    constructor(assets) {
      this.assets = assets;
      this.tooltip = new AB.Tooltip(document.getElementById("tooltip"));
      this.history = [];
      this.combatSpeed = 1;
      this.lastTime = 0;
      this.combatSnapshot = null;
      this.previousTraitTiers = {};
      this.initializeWorld();
      this.initializeUi();
      this.bindEvents();
    }

    initializeWorld() {
      this.bus = new AB.EventBus();
      this.phaseMachine = new AB.StateMachine("Preparation", {
        Preparation: ["Shop", "Game Over"],
        Shop: ["Placement", "Game Over"],
        Placement: ["Combat", "Game Over"],
        Combat: ["Reward", "Game Over"],
        Reward: ["Preparation", "Game Over"],
        "Game Over": ["Preparation"],
      });
      this.phase = "Preparation";
      this.board = new AB.Board();
      this.player = new AB.Player(
        "Player",
        "player",
        AB.GAME_CONFIG.playerStartGold,
        AB.GAME_CONFIG.playerStartHp,
      );
      this.ai = new AB.AIPlayer();
      this.traits = new AB.TraitSystem();
      this.upgrades = new AB.UpgradeSystem(this.bus);
      this.economy = new AB.EconomySystem();
      this.enemyAI = new AB.EnemyAISystem(this.upgrades);
      this.combat = new AB.CombatSystem(this.board, this.bus);
      this.roundSystem = new AB.RoundSystem(this);
      this.seedStartingUnits();
    }

    initializeUi() {
      document.getElementById("coin-icon").src = this.assets.icons.coin;
      document.getElementById("xp-icon").src = this.assets.icons.xp;
      this.hud = new AB.HUD(this);
      this.traitPanel = null;
      this.healthPanel = null;
      this.shopUi = new AB.ShopUI(document.getElementById("shop-list"), this, this.tooltip);
      this.benchUi = new AB.BenchUI(document.getElementById("bench-list"), this, this.tooltip);
      this.boardUi = new AB.BoardUI(document.getElementById("board-canvas"), this, this.tooltip);
      this.dragDrop = new AB.DragDropSystem(this, this.boardUi, this.benchUi);
      this.benchUi.setDragDrop(this.dragDrop);
    }

    bindEvents() {
      this.bus.on("toast", ({ message, type }) => this.toast(message, type));
      this.bus.on("unit-upgraded", () => AB.GeneratedAssets.playTone(620, 0.14));
    }

    seedStartingUnits() {
      this.player.bench.add(new AB.Unit("knight", "player"));
      this.player.bench.add(new AB.Unit("archer", "player"));
    }

    start() {
      this.hud.hideGameOver();
      this.roundSystem.startRound();
      this.refreshUI();
      requestAnimationFrame((time) => this.loop(time));
    }

    loop(time) {
      const delta = Math.min(0.05, (time - this.lastTime) / 1000 || 0);
      this.lastTime = time;
      this.roundSystem.update(delta);
      this.combat.update(delta * this.combatSpeed);
      this.boardUi.render();
      this.hud.render();
      requestAnimationFrame((nextTime) => this.loop(nextTime));
    }

    setPhase(nextPhase) {
      if (this.phase !== nextPhase) {
        this.phaseMachine.transition(nextPhase);
      }
      this.phase = nextPhase;
      if (nextPhase !== "Combat") {
        this.refreshUI();
      }
      if (["Preparation", "Shop", "Placement", "Reward"].includes(nextPhase)) {
        this.hud.showBanner(nextPhase);
      }
    }

    prepareRound() {
      this.player.shop.refresh();
      this.enemyAI.prepare(this.ai, this.roundSystem.round);
      this.restorePlayerPositions();
      this.board.rebuildOccupancy(this.player.boardUnits);
      this.refreshUI();
    }

    restorePlayerPositions() {
      this.player.boardUnits.forEach((unit) => {
        if (unit.gridX === null || unit.gridY === null) {
          const openTile = this.getValidPlayerTiles()[0];
          if (openTile) {
            this.board.placeUnit(unit, openTile.x, openTile.y);
          }
        } else {
          unit.setBoardPosition(unit.gridX, unit.gridY, this.board.tileToPixel(unit.gridX, unit.gridY));
        }
      });
    }

    refreshUI() {
      this.shopUi.render(this.player.shop.cards);
      this.benchUi.render(this.player.bench);
      if (this.traitPanel) {
        this.traitPanel.render(this.traits.getDisplayRows(this.player.boardUnits));
      }
    
      if (this.healthPanel) {
        this.healthPanel.render(this.player, this.ai, this.history);
      }
      this.hud.render();
      this.updateTraitFeedback();
    }

    updateTraitFeedback() {
      const rows = this.traits.getDisplayRows(this.player.boardUnits);
      rows.forEach((row) => {
        const previous = this.previousTraitTiers[row.name] || 0;
        if (row.tier > previous) {
          this.toast(`${row.name} trait activated.`, "good");
        }
        this.previousTraitTiers[row.name] = row.tier;
      });
    }

    canShop() {
      return this.phase === "Shop" || this.phase === "Placement";
    }

    canPlaceUnits() {
      return this.phase === "Placement";
    }

    notifyCombatLocked() {
      if (this.phase === "Combat") {
        this.toast("Combat in progress.", "bad");
      }
    }

    toast(message, type = "") {
      this.hud.toast(message, type);
    }

    buyUnit(unitId, cardIndex) {
      if (!this.canShop()) {
        this.notifyPhaseLocked();
        return;
      }
      const config = AB.UNIT_CONFIG[unitId];
      if (this.player.gold < config.cost) {
        this.toast("Not enough gold.", "bad");
        return;
      }
      if (!this.player.bench.hasSpace) {
        this.toast("Bench full.", "bad");
        return;
      }
      this.player.gold -= config.cost;
      const unit = new AB.Unit(unitId, "player");
      this.player.bench.add(unit);
      this.player.shop.cards.splice(cardIndex, 1);
      this.upgrades.resolve(this.player, unitId);
      this.board.rebuildOccupancy(this.player.boardUnits.concat(this.ai.boardUnits));
      AB.GeneratedAssets.playTone(440, 0.08);
      this.refreshUI();
    }

    refreshShop() {
      if (!this.canShop()) {
        this.notifyPhaseLocked();
        return;
      }
      if (this.player.gold < AB.GAME_CONFIG.refreshCost) {
        this.toast("Not enough gold to refresh.", "bad");
        return;
      }
      this.player.gold -= AB.GAME_CONFIG.refreshCost;
      this.player.shop.refresh();
      this.refreshUI();
    }

    buyXp() {
      if (!this.canShop()) {
        this.notifyPhaseLocked();
        return;
      }
      if (this.player.level >= AB.GAME_CONFIG.maxLevel) {
        this.toast("Maximum level reached.", "bad");
        return;
      }
      if (this.player.gold < AB.GAME_CONFIG.xpCost) {
        this.toast("Not enough gold for XP.", "bad");
        return;
      }
      this.player.gold -= AB.GAME_CONFIG.xpCost;
      this.player.gainXp(AB.GAME_CONFIG.xpPerBuy);
      this.refreshUI();
    }

    notifyPhaseLocked() {
      if (this.phase === "Combat") {
        this.toast("Combat in progress.", "bad");
      } else {
        this.toast("Wait for the shop phase.", "bad");
      }
    }

    getValidPlayerTiles() {
      const tiles = [];
      for (let y = this.board.playerStartRow; y < this.board.rows; y += 1) {
        for (let x = 0; x < this.board.cols; x += 1) {
          if (!this.board.isOccupied(x, y)) {
            tiles.push({ x, y });
          }
        }
      }
      return tiles;
    }

    tryPlaceDraggedUnit(drag, tile) {
      if (!this.canPlaceUnits() || !this.board.isPlayerTile(tile.x, tile.y) || this.board.isOccupied(tile.x, tile.y)) {
        return false;
      }
      if (drag.from === "bench" && this.player.boardUnits.length >= this.player.boardCapacity) {
        this.toast("Unit cap reached. Buy XP to field more units.", "bad");
        return false;
      }
      if (drag.from === "bench") {
        this.player.bench.remove(drag.benchIndex);
        this.player.boardUnits.push(drag.unit);
      }
      this.board.placeUnit(drag.unit, tile.x, tile.y);
      return true;
    }

    startCombat() {
      if (this.phase !== "Placement") {
        return false;
      }
      if (this.player.boardUnits.length === 0) {
        this.toast("Place at least one unit first.", "bad");
        return false;
      }
      this.deployEnemyUnits();
      this.combatSnapshot = {
        player: this.player.boardUnits.map((unit) => ({ unit, x: unit.gridX, y: unit.gridY })),
        enemy: this.ai.boardUnits.map((unit) => ({ unit, x: unit.gridX, y: unit.gridY })),
      };
      this.setPhase("Combat");
      this.hud.showBanner("Combat");
      AB.GeneratedAssets.playTone(220, 0.18);
      this.combat.start(
        this.player.boardUnits,
        this.ai.boardUnits,
        this.traits,
        (result) => this.finishCombat(result),
      );
      return true;
    }

    deployEnemyUnits() {
      this.ai.boardUnits.forEach((unit) => {
        unit.setBoardPosition(unit.gridX, unit.gridY, this.board.tileToPixel(unit.gridX, unit.gridY));
      });
      this.board.rebuildOccupancy(this.player.boardUnits.concat(this.ai.boardUnits));
    }

    finishCombat(result) {
      this.restoreSnapshot();
      const playerWon = result.winner === "player";
      const aiWon = result.winner === "enemy";
      const playerDamage = aiWon
        ? Math.max(1, result.enemySurvivors.reduce((sum, unit) => sum + unit.starLevel, 0))
        : 0;
      const aiDamage = playerWon
        ? Math.max(1, result.playerSurvivors.reduce((sum, unit) => sum + unit.starLevel, 0))
        : 0;
      this.player.hp = Math.max(0, this.player.hp - playerDamage);
      this.ai.hp = Math.max(0, this.ai.hp - aiDamage);
      this.economy.grantRoundIncome(this.player, playerWon);
      this.economy.grantRoundIncome(this.ai, aiWon);

      const label = playerWon ? "Won" : aiWon ? "Lost" : "Draw";
      const damage = playerWon ? aiDamage : playerDamage;
      this.history.push(`Round ${this.roundSystem.round}: ${label}${damage ? ` (${damage} damage)` : ""}`);
      this.toast(
        playerWon ? "Round won." : aiWon ? "Round lost." : "Round drawn.",
        playerWon ? "good" : aiWon ? "bad" : "",
      );

      if (this.player.hp <= 0 || this.ai.hp <= 0) {
        this.setPhase("Game Over");
        this.hud.showGameOver(this.ai.hp <= 0);
        return;
      }

      this.roundSystem.startReward();
      this.refreshUI();
    }

    restoreSnapshot() {
      this.board.occupancy.clear();
      this.combatSnapshot.player.concat(this.combatSnapshot.enemy).forEach(({ unit, x, y }) => {
        unit.isDead = false;
        unit.state = "idle";
        unit.currentHp = unit.maxHp;
        unit.currentMana = 0;
        unit.shield = 0;
        unit.stunTimer = 0;
        unit.tauntTimer = 0;
        unit.forcedTargetId = null;
        unit.gridX = x;
        unit.gridY = y;
        unit.setBoardPosition(x, y, this.board.tileToPixel(x, y));
      });
      this.board.rebuildOccupancy(this.player.boardUnits);
    }

    nextRound() {
      if (this.phase !== "Reward") {
        return;
      }
      this.roundSystem.advanceRound();
      this.refreshUI();
    }

    reset() {
      this.initializeWorld();
      this.bindEvents();
      this.hud.hideGameOver();
      this.history = [];
      this.combatSpeed = 1;
      document.querySelectorAll(".speed-button").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.speed === "1");
      });
      this.previousTraitTiers = {};
      this.roundSystem.startRound();
      this.refreshUI();
    }
  }

  AB.Game = Game;
})(window.AutoBattler = window.AutoBattler || {});
