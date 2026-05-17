(function (AB) {
  class UpgradeSystem {
    constructor(bus) {
      this.bus = bus;
    }

    resolve(player, unitId) {
      let upgraded = false;
      for (let star = 1; star < 3; star += 1) {
        const matching = player.allUnits.filter(
          (unit) => unit.unitId === unitId && unit.starLevel === star,
        );
        if (matching.length < 3) {
          continue;
        }

        const survivor = matching.find((unit) => unit.location === "board") || matching[0];
        const consumed = matching.filter((unit) => unit !== survivor).slice(0, 2);
        consumed.forEach((unit) => {
          if (unit.location === "bench") {
            player.bench.removeUnit(unit);
          } else {
            player.boardUnits = player.boardUnits.filter((item) => item !== unit);
          }
        });
        survivor.upgrade();
        upgraded = true;
        if (player.team === "player") {
          this.bus.emit("toast", {
            type: "good",
            message: `${survivor.name} upgraded to ${survivor.starLevel} stars.`,
          });
          this.bus.emit("unit-upgraded", survivor);
        }
        if (survivor.starLevel < 3) {
          this.resolve(player, unitId);
        }
      }
      player.bench.compact();
      return upgraded;
    }
  }

  AB.UpgradeSystem = UpgradeSystem;
})(window.AutoBattler = window.AutoBattler || {});
