(function (AB) {
  class RoundSystem {
    constructor(game) {
      this.game = game;
      this.round = 1;
      this.phaseTimer = 0;
    }

    startRound() {
      this.game.setPhase("Preparation");
      this.phaseTimer = AB.GAME_CONFIG.phaseDurations.Preparation;
      this.game.prepareRound();
    }

    update(delta) {
      if (this.game.phase === "Combat" || this.game.phase === "Game Over") {
        return;
      }
      this.phaseTimer = Math.max(0, this.phaseTimer - delta);
      if (this.phaseTimer > 0) {
        return;
      }

      if (this.game.phase === "Preparation") {
        this.game.setPhase("Shop");
        this.phaseTimer = AB.GAME_CONFIG.phaseDurations.Shop;
      } else if (this.game.phase === "Shop") {
        this.game.setPhase("Placement");
        this.phaseTimer = AB.GAME_CONFIG.phaseDurations.Placement;
      } else if (this.game.phase === "Placement") {
        const started = this.game.startCombat();
        if (!started) {
          this.phaseTimer = 5;
        }
      }
    }

    startReward() {
      this.game.setPhase("Reward");
      this.phaseTimer = 0;
    }

    advanceRound() {
      this.round += 1;
      this.startRound();
    }
  }

  AB.RoundSystem = RoundSystem;
})(window.AutoBattler = window.AutoBattler || {});
