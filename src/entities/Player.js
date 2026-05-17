(function (AB) {
  class Player {
    constructor(name, team, startingGold, startingHp) {
      this.name = name;
      this.team = team;
      this.gold = startingGold;
      this.hp = startingHp;
      this.maxHp = startingHp;
      this.level = AB.GAME_CONFIG.startLevel;
      this.xp = 0;
      this.bench = new AB.Bench(AB.GAME_CONFIG.benchSize);
      this.boardUnits = [];
      this.shop = new AB.Shop(this);
      this.winStreak = 0;
      this.lossStreak = 0;
      this.lastIncome = null;
    }

    get boardCapacity() {
      return this.level;
    }

    get allUnits() {
      return this.boardUnits.concat(this.bench.allUnits());
    }

    get nextLevelXp() {
      return AB.GAME_CONFIG.levelThresholds[this.level] || 0;
    }

    gainXp(amount) {
      if (this.level >= AB.GAME_CONFIG.maxLevel) {
        return false;
      }
      this.xp += amount;
      while (this.level < AB.GAME_CONFIG.maxLevel && this.xp >= this.nextLevelXp) {
        this.xp -= this.nextLevelXp;
        this.level += 1;
      }
      return true;
    }
  }

  AB.Player = Player;
})(window.AutoBattler = window.AutoBattler || {});
