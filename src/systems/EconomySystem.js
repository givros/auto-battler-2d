(function (AB) {
  class EconomySystem {
    getStreakBonus(player) {
      const streak = Math.max(player.winStreak, player.lossStreak);
      if (streak >= 4) {
        return 2;
      }
      if (streak >= 2) {
        return 1;
      }
      return 0;
    }

    grantRoundIncome(player, didWin) {
      if (didWin) {
        player.winStreak += 1;
        player.lossStreak = 0;
      } else {
        player.lossStreak += 1;
        player.winStreak = 0;
      }

      const base = AB.GAME_CONFIG.economy.baseIncome;
      const interest = Math.min(
        AB.GAME_CONFIG.economy.maxInterest,
        Math.floor(player.gold / 10),
      );
      const streak = this.getStreakBonus(player);
      const resultBonus = didWin
        ? AB.GAME_CONFIG.economy.winBonus
        : AB.GAME_CONFIG.economy.lossBonus;
      const total = base + interest + streak + resultBonus;
      player.gold += total;
      player.lastIncome = { base, interest, streak, resultBonus, total };
      return player.lastIncome;
    }
  }

  AB.EconomySystem = EconomySystem;
})(window.AutoBattler = window.AutoBattler || {});
