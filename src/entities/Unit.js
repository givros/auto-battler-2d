(function (AB) {
  let nextUnitId = 1;

  class Unit {
    constructor(unitId, team, starLevel = 1) {
      const config = AB.UNIT_CONFIG[unitId];
      this.uid = `unit-${nextUnitId++}`;
      this.unitId = unitId;
      this.team = team;
      this.name = config.name;
      this.cost = config.cost;
      this.rarity = config.rarity;
      this.className = config.className;
      this.origin = config.origin;
      this.ability = config.ability;
      this.starLevel = starLevel;
      this.location = "bench";
      this.benchIndex = null;
      this.gridX = null;
      this.gridY = null;
      this.renderX = 0;
      this.renderY = 0;
      this.targetRenderX = 0;
      this.targetRenderY = 0;
      this.state = "idle";
      this.poseTimer = 0;
      this.attackCooldown = 0;
      this.moveProgress = 0;
      this.currentHp = 0;
      this.maxHp = 0;
      this.currentMana = 0;
      this.maxMana = config.mana;
      this.shield = 0;
      this.isDead = false;
      this.stunTimer = 0;
      this.tauntTimer = 0;
      this.forcedTargetId = null;
      this.critChance = 0;
      this.dodgeChance = 0;
      this.abilityPowerBonus = 0;
      this.armorBonus = 0;
      this.enemyArmorReduction = 0;
      this.baseStats = config;
      this.resetForCombat({
        armorBonus: 0,
        abilityPowerBonus: 0,
        critChance: 0,
        dodgeChance: 0,
        shield: 0,
        enemyArmorReduction: 0,
      });
    }

    getStarMultiplier() {
      return [0, 1, 1.8, 3][this.starLevel];
    }

    get abilityPower() {
      return this.baseStats.abilityPower * this.getStarMultiplier() * (1 + this.abilityPowerBonus);
    }

    get attackDamage() {
      return this.baseStats.attackDamage * this.getStarMultiplier();
    }

    get attackSpeed() {
      return this.baseStats.attackSpeed;
    }

    get attackRange() {
      return this.baseStats.attackRange;
    }

    get movementSpeed() {
      return this.baseStats.movementSpeed;
    }

    get armor() {
      return this.baseStats.armor + this.armorBonus;
    }

    resetForCombat(bonuses) {
      this.maxHp = Math.round(this.baseStats.hp * this.getStarMultiplier());
      this.currentHp = this.maxHp;
      this.currentMana = 0;
      this.maxMana = this.baseStats.mana;
      this.shield = bonuses.shield || 0;
      this.isDead = false;
      this.state = "idle";
      this.poseTimer = 0;
      this.attackCooldown = Math.random() * 0.4;
      this.moveProgress = 0;
      this.stunTimer = 0;
      this.tauntTimer = 0;
      this.forcedTargetId = null;
      this.critChance = bonuses.critChance || 0;
      this.dodgeChance = bonuses.dodgeChance || 0;
      this.abilityPowerBonus = bonuses.abilityPowerBonus || 0;
      this.armorBonus = bonuses.armorBonus || 0;
      this.enemyArmorReduction = bonuses.enemyArmorReduction || 0;
    }

    setBoardPosition(x, y, pixel) {
      this.gridX = x;
      this.gridY = y;
      this.location = "board";
      this.renderX = pixel.x;
      this.renderY = pixel.y;
      this.targetRenderX = pixel.x;
      this.targetRenderY = pixel.y;
      this.benchIndex = null;
    }

    setTargetPosition(pixel) {
      this.targetRenderX = pixel.x;
      this.targetRenderY = pixel.y;
    }

    updateVisual(delta) {
      const speed = Math.min(1, delta * 10);
      this.renderX = AB.math.lerp(this.renderX, this.targetRenderX, speed);
      this.renderY = AB.math.lerp(this.renderY, this.targetRenderY, speed);
      this.poseTimer = Math.max(0, this.poseTimer - delta);
      if (this.poseTimer === 0 && !this.isDead) {
        this.state = "idle";
      }
    }

    setPose(state, duration) {
      if (this.isDead && state !== "death") {
        return;
      }
      this.state = state;
      this.poseTimer = duration;
    }

    upgrade() {
      this.starLevel = Math.min(3, this.starLevel + 1);
    }

    receiveShield(amount) {
      this.shield += amount;
    }

    receiveDamage(amount) {
      let remaining = amount;
      if (this.shield > 0) {
        const absorbed = Math.min(this.shield, remaining);
        this.shield -= absorbed;
        remaining -= absorbed;
      }
      this.currentHp = Math.max(0, this.currentHp - remaining);
      return remaining;
    }

    markDead() {
      this.isDead = true;
      this.state = "death";
      this.poseTimer = AB.GAME_CONFIG.combat.deathHoldTime;
    }
  }

  AB.Unit = Unit;
})(window.AutoBattler = window.AutoBattler || {});
