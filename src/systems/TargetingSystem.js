(function (AB) {
  class TargetingSystem {
    findTarget(unit, enemies) {
      const aliveEnemies = enemies.filter((enemy) => !enemy.isDead);
      if (!aliveEnemies.length) {
        return null;
      }

      if (unit.forcedTargetId) {
        const forced = aliveEnemies.find((enemy) => enemy.uid === unit.forcedTargetId);
        if (forced) {
          return forced;
        }
      }

      return aliveEnemies.sort(
        (left, right) => AB.math.distanceManhattan(unit, left) - AB.math.distanceManhattan(unit, right),
      )[0];
    }
  }

  AB.TargetingSystem = TargetingSystem;
})(window.AutoBattler = window.AutoBattler || {});
