(function (AB) {
  class MovementSystem {
    moveToward(board, unit, target, delta) {
      unit.moveProgress += unit.movementSpeed * delta;
      if (unit.moveProgress < 1) {
        return;
      }

      unit.moveProgress = 0;
      const step = AB.pathfinding.nextStepToward(board, unit, target, unit.attackRange);
      if (!step) {
        return;
      }
      board.moveUnit(unit, step.x, step.y);
    }
  }

  AB.MovementSystem = MovementSystem;
})(window.AutoBattler = window.AutoBattler || {});
