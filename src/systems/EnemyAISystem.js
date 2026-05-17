(function (AB) {
  class EnemyAISystem {
    constructor(upgradeSystem) {
      this.upgradeSystem = upgradeSystem;
    }

    prepare(ai, round) {
      const target = AB.ROUND_CONFIG.aiRoundTargets[Math.min(round - 1, AB.ROUND_CONFIG.aiRoundTargets.length - 1)];
      ai.level = Math.max(ai.level, target.level);
      ai.gold += target.bonusGold;
      ai.shop.refresh();
      const desiredTraits = this.getPreferredTraits(ai);

      for (let pass = 0; pass < 2; pass += 1) {
        ai.shop.cards.forEach((unitId) => {
          const config = AB.UNIT_CONFIG[unitId];
          const score = this.scoreUnit(config, desiredTraits);
          if (!ai.bench.hasSpace || ai.gold < config.cost) {
            return;
          }
          const shouldBuy = score >= 2 || ai.boardUnits.length + ai.bench.allUnits().length < target.minUnits;
          if (shouldBuy) {
            ai.gold -= config.cost;
            const unit = new AB.Unit(unitId, "enemy");
            ai.bench.add(unit);
            this.upgradeSystem.resolve(ai, unitId);
          }
        });
        if (ai.gold >= 12 && AB.random.chance(0.35)) {
          ai.gold -= AB.GAME_CONFIG.refreshCost;
          ai.shop.refresh();
        }
      }

      this.placeUnits(ai);
    }

    getPreferredTraits(ai) {
      const counts = {};
      ai.boardUnits.concat(ai.bench.allUnits()).forEach((unit) => {
        counts[unit.className] = (counts[unit.className] || 0) + 1;
        counts[unit.origin] = (counts[unit.origin] || 0) + 1;
      });
      return counts;
    }

    scoreUnit(config, desiredTraits) {
      return (desiredTraits[config.className] || 0) + (desiredTraits[config.origin] || 0) + config.cost;
    }

    placeUnits(ai) {
      const available = ai.boardUnits.concat(ai.bench.allUnits());
      ai.bench.slots = Array.from({ length: ai.bench.slots.length }, () => null);
      ai.boardUnits = available
        .sort((left, right) => {
          const leftScore = left.starLevel * 10 + left.cost;
          const rightScore = right.starLevel * 10 + right.cost;
          return rightScore - leftScore;
        })
        .slice(0, ai.boardCapacity);
      available
        .filter((unit) => !ai.boardUnits.includes(unit))
        .forEach((unit) => ai.bench.add(unit));

      const frontCells = [
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 2, y: 2 },
        { x: 5, y: 2 },
      ];
      const backCells = [
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 2, y: 0 },
        { x: 5, y: 0 },
      ];
      const sideCells = [
        { x: 0, y: 1 },
        { x: 7, y: 1 },
      ];

      ai.boardUnits.forEach((unit) => {
        const pool = unit.className === "Assassin"
          ? sideCells
          : unit.attackRange > 1
            ? backCells
            : frontCells;
        const cell = pool.shift() || frontCells.shift() || backCells.shift() || sideCells.shift();
        if (cell) {
          unit.gridX = cell.x;
          unit.gridY = cell.y;
          unit.location = "board";
        }
      });
    }
  }

  AB.EnemyAISystem = EnemyAISystem;
})(window.AutoBattler = window.AutoBattler || {});
