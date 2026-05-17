(function (AB) {
  class TraitSystem {
    getCounts(units) {
      const counts = {};
      units.forEach((unit) => {
        counts[unit.className] = (counts[unit.className] || 0) + 1;
        counts[unit.origin] = (counts[unit.origin] || 0) + 1;
      });
      return counts;
    }

    getTier(traitName, count) {
      const thresholds = AB.TRAIT_CONFIG[traitName].thresholds;
      let tier = 0;
      thresholds.forEach((threshold, index) => {
        if (count >= threshold) {
          tier = index + 1;
        }
      });
      return tier;
    }

    getBonuses(units) {
      const counts = this.getCounts(units);
      const bonuses = {
        armorBonus: 0,
        abilityPowerBonus: 0,
        critChance: 0,
        dodgeChance: 0,
        shield: 0,
        enemyArmorReduction: 0,
      };

      const warriorTier = this.getTier("Warrior", counts.Warrior || 0);
      bonuses.armorBonus = [0, 10, 25, 45][warriorTier];

      const mageTier = this.getTier("Mage", counts.Mage || 0);
      bonuses.abilityPowerBonus = [0, 0.2, 0.45][mageTier];

      const assassinTier = this.getTier("Assassin", counts.Assassin || 0);
      bonuses.critChance = [0, 0.2, 0.45][assassinTier];

      const guardianTier = this.getTier("Guardian", counts.Guardian || 0);
      bonuses.shield = [0, 120, 260][guardianTier];

      const elfTier = this.getTier("Elf", counts.Elf || 0);
      bonuses.dodgeChance = [0, 0.15, 0.3][elfTier];

      const undeadTier = this.getTier("Undead", counts.Undead || 0);
      bonuses.enemyArmorReduction = [0, 10, 25][undeadTier];

      return bonuses;
    }

    getDisplayRows(units) {
      const counts = this.getCounts(units);
      return Object.entries(AB.TRAIT_CONFIG).map(([name, config]) => ({
        name,
        icon: config.icon,
        count: counts[name] || 0,
        thresholds: config.thresholds,
        tier: this.getTier(name, counts[name] || 0),
      }));
    }
  }

  AB.TraitSystem = TraitSystem;
})(window.AutoBattler = window.AutoBattler || {});
