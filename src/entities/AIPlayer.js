(function (AB) {
  class AIPlayer extends AB.Player {
    constructor() {
      super("AI", "enemy", AB.GAME_CONFIG.aiStartGold, AB.GAME_CONFIG.aiStartHp);
      this.isAI = true;
      this.level = 2;
    }
  }

  AB.AIPlayer = AIPlayer;
})(window.AutoBattler = window.AutoBattler || {});
