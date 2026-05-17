(function (AB) {
  AB.pathfinding = {
    nextStepToward(board, unit, target, desiredRange) {
      const queue = [{ x: unit.gridX, y: unit.gridY, path: [] }];
      const seen = new Set([`${unit.gridX},${unit.gridY}`]);
      const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ];

      while (queue.length) {
        const current = queue.shift();
        const distance = Math.abs(current.x - target.gridX) + Math.abs(current.y - target.gridY);
        if (distance <= desiredRange && current.path.length > 0) {
          return current.path[0];
        }

        directions.forEach((direction) => {
          const x = current.x + direction.x;
          const y = current.y + direction.y;
          const key = `${x},${y}`;
          if (!board.isInside(x, y) || seen.has(key)) {
            return;
          }
          if (board.isOccupied(x, y) && !(x === target.gridX && y === target.gridY)) {
            return;
          }
          seen.add(key);
          queue.push({
            x,
            y,
            path: current.path.concat([{ x, y }]),
          });
        });
      }

      return null;
    },
  };
})(window.AutoBattler = window.AutoBattler || {});
