(function (AB) {
  class AbilitySystem {
    cast(unit, context) {
      const abilityId = unit.ability.id;
      unit.currentMana = 0;
      switch (abilityId) {
        case "shield-bash":
          this.shieldBash(unit, context);
          break;
        case "piercing-shot":
          this.piercingShot(unit, context);
          break;
        case "arcane-orb":
          this.arcaneOrb(unit, context);
          break;
        case "stone-guard":
          this.stoneGuard(unit, context);
          break;
        case "shadow-strike":
          this.shadowStrike(unit, context);
          break;
        default:
          break;
      }
    }

    shieldBash(unit, context) {
      const target = context.targeting.findTarget(unit, context.enemies);
      if (!target) {
        return;
      }
      context.combat.applyDamage(unit, target, unit.abilityPower, "physical", true);
      target.stunTimer = 1.2;
      context.combat.addSpellEffect(target, "#fff0a0", 32);
    }

    piercingShot(unit, context) {
      const target = context.targeting.findTarget(unit, context.enemies);
      if (!target) {
        return;
      }
      context.combat.applyDamage(unit, target, unit.abilityPower, "physical", true);
      const behind = context.enemies.find((enemy) => {
        if (enemy.isDead || enemy === target) {
          return false;
        }
        const sameColumn = enemy.gridX === target.gridX;
        const isBehind = unit.team === "player" ? enemy.gridY < target.gridY : enemy.gridY > target.gridY;
        return sameColumn && isBehind;
      });
      if (behind) {
        context.combat.applyDamage(unit, behind, unit.abilityPower * 0.7, "physical", true);
      }
      context.combat.addProjectileEffect(unit, target, "#87e8ff");
    }

    arcaneOrb(unit, context) {
      const target = context.targeting.findTarget(unit, context.enemies);
      if (!target) {
        return;
      }
      context.enemies.forEach((enemy) => {
        const distance = Math.abs(enemy.gridX - target.gridX) + Math.abs(enemy.gridY - target.gridY);
        if (!enemy.isDead && distance <= 1) {
          context.combat.applyDamage(unit, enemy, unit.abilityPower, "magic", true);
        }
      });
      context.combat.addSpellEffect(target, "#b472ff", 44);
    }

    stoneGuard(unit, context) {
      unit.receiveShield(unit.abilityPower);
      context.enemies.forEach((enemy) => {
        if (!enemy.isDead) {
          enemy.forcedTargetId = unit.uid;
          enemy.tauntTimer = 2.4;
        }
      });
      context.combat.addSpellEffect(unit, "#78d8ff", 38);
    }

    shadowStrike(unit, context) {
      const enemies = context.enemies.filter((enemy) => !enemy.isDead);
      if (!enemies.length) {
        return;
      }
      const target = enemies.sort((left, right) => {
        return unit.team === "player"
          ? left.gridY - right.gridY
          : right.gridY - left.gridY;
      })[0];
      const landingOptions = [
        { x: target.gridX - 1, y: target.gridY },
        { x: target.gridX + 1, y: target.gridY },
        { x: target.gridX, y: target.gridY + (unit.team === "player" ? -1 : 1) },
      ].filter((tile) => context.board.isInside(tile.x, tile.y) && !context.board.isOccupied(tile.x, tile.y));
      if (landingOptions.length) {
        const landing = landingOptions[0];
        context.board.moveUnit(unit, landing.x, landing.y);
      }
      context.combat.applyDamage(unit, target, unit.abilityPower * 1.2, "physical", true, true);
      context.combat.addSpellEffect(target, "#a565ff", 34);
    }
  }

  AB.AbilitySystem = AbilitySystem;
})(window.AutoBattler = window.AutoBattler || {});
