(function (AB) {
  class CombatSystem {
    constructor(board, bus) {
      this.board = board;
      this.bus = bus;
      this.targeting = new AB.TargetingSystem();
      this.movement = new AB.MovementSystem();
      this.abilities = new AB.AbilitySystem();
      this.active = false;
      this.playerUnits = [];
      this.enemyUnits = [];
      this.elapsed = 0;
      this.effects = [];
      this.damageNumbers = [];
      this.onComplete = null;
    }

    start(playerUnits, enemyUnits, traitSystem, onComplete) {
      this.active = true;
      this.elapsed = 0;
      this.playerUnits = playerUnits;
      this.enemyUnits = enemyUnits;
      this.onComplete = onComplete;

      const playerBonuses = traitSystem.getBonuses(playerUnits);
      const enemyBonuses = traitSystem.getBonuses(enemyUnits);
      playerUnits.forEach((unit) => unit.resetForCombat(playerBonuses));
      enemyUnits.forEach((unit) => unit.resetForCombat(enemyBonuses));
      this.board.rebuildOccupancy(playerUnits.concat(enemyUnits));
    }

    update(delta) {
      if (!this.active) {
        return;
      }
      this.elapsed += delta;
      this.updateTeam(this.playerUnits, this.enemyUnits, delta);
      this.updateTeam(this.enemyUnits, this.playerUnits, delta);
      this.playerUnits.concat(this.enemyUnits).forEach((unit) => unit.updateVisual(delta));
      this.updateEffects(delta);
      this.checkEnd();
    }

    updateTeam(allies, enemies, delta) {
      allies.forEach((unit) => {
        if (unit.isDead) {
          return;
        }
        unit.attackCooldown = Math.max(0, unit.attackCooldown - delta);
        unit.stunTimer = Math.max(0, unit.stunTimer - delta);
        unit.tauntTimer = Math.max(0, unit.tauntTimer - delta);
        if (unit.tauntTimer === 0) {
          unit.forcedTargetId = null;
        }
        if (unit.stunTimer > 0) {
          return;
        }

        const target = this.targeting.findTarget(unit, enemies);
        if (!target) {
          return;
        }

        if (unit.currentMana >= unit.maxMana) {
          this.abilities.cast(unit, {
            board: this.board,
            combat: this,
            enemies,
            targeting: this.targeting,
          });
          return;
        }

        const distance = AB.math.distanceManhattan(unit, target);
        if (distance <= unit.attackRange) {
          if (unit.attackCooldown === 0) {
            this.performAttack(unit, target);
          }
          return;
        }
        this.movement.moveToward(this.board, unit, target, delta);
      });
    }

    performAttack(attacker, target) {
      attacker.attackCooldown = 1 / attacker.attackSpeed;
      attacker.currentMana = Math.min(attacker.maxMana, attacker.currentMana + AB.GAME_CONFIG.combat.manaOnAttack);
      attacker.setPose("attack", AB.GAME_CONFIG.combat.attackPoseTime);
      this.applyDamage(attacker, target, attacker.attackDamage, "physical", false);
      this.addProjectileEffect(attacker, target, attacker.attackRange > 1 ? "#ffe3a0" : "#fff0c9");
    }

    applyDamage(attacker, target, rawAmount, type, isAbility, forceCrit = false) {
      if (target.isDead) {
        return 0;
      }
      if (AB.random.chance(target.dodgeChance)) {
        this.damageNumbers.push({
          x: target.renderX,
          y: target.renderY - 48,
          value: "Dodge",
          life: 0.8,
          maxLife: 0.8,
          color: "#c3ffd3",
        });
        return 0;
      }

      const critical = forceCrit || AB.random.chance(attacker.critChance);
      let amount = rawAmount * (critical ? 1.6 : 1);
      if (type === "physical") {
        const armor = Math.max(-30, target.armor - attacker.enemyArmorReduction);
        amount *= 100 / (100 + armor);
      }
      amount = Math.round(amount);
      const dealt = target.receiveDamage(amount);
      target.currentMana = Math.min(target.maxMana, target.currentMana + AB.GAME_CONFIG.combat.manaOnHit);
      target.setPose("defend", AB.GAME_CONFIG.combat.defendPoseTime);
      this.damageNumbers.push({
        x: target.renderX,
        y: target.renderY - 48,
        value: `${critical ? "!" : ""}${dealt}`,
        life: 0.8,
        maxLife: 0.8,
        color: critical ? "#ffd26b" : isAbility ? "#d2a6ff" : "#ffffff",
      });

      if (target.currentHp <= 0) {
        target.markDead();
        this.board.removeUnit(target);
      }
      return dealt;
    }

    addProjectileEffect(attacker, target, color) {
      this.effects.push({
        type: "attack",
        x1: attacker.renderX,
        y1: attacker.renderY - 18,
        x2: target.renderX,
        y2: target.renderY - 18,
        color,
        life: 0.16,
        maxLife: 0.16,
      });
    }

    addSpellEffect(unit, color, radius) {
      this.effects.push({
        type: "spell",
        x: unit.renderX,
        y: unit.renderY - 14,
        radius,
        color,
        life: 0.4,
        maxLife: 0.4,
      });
    }

    updateEffects(delta) {
      this.effects.forEach((effect) => {
        effect.life -= delta;
      });
      this.damageNumbers.forEach((number) => {
        number.life -= delta;
        number.y -= 24 * delta;
      });
      this.effects = this.effects.filter((effect) => effect.life > 0);
      this.damageNumbers = this.damageNumbers.filter((number) => number.life > 0);
    }

    checkEnd() {
      const playerAlive = this.playerUnits.filter((unit) => !unit.isDead);
      const enemyAlive = this.enemyUnits.filter((unit) => !unit.isDead);
      if (playerAlive.length && enemyAlive.length && this.elapsed < AB.GAME_CONFIG.combat.maxSeconds) {
        return;
      }
      this.active = false;
      let winner = "draw";
      if (playerAlive.length > enemyAlive.length) {
        winner = "player";
      } else if (enemyAlive.length > playerAlive.length) {
        winner = "enemy";
      }
      this.onComplete({
        winner,
        playerSurvivors: playerAlive,
        enemySurvivors: enemyAlive,
      });
    }
  }

  AB.CombatSystem = CombatSystem;
})(window.AutoBattler = window.AutoBattler || {});
