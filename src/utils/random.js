(function (AB) {
  AB.random = {
    pick(items) {
      return items[Math.floor(Math.random() * items.length)];
    },

    weightedPick(weightMap) {
      const entries = Object.entries(weightMap);
      const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
      let cursor = Math.random() * total;
      for (const [key, weight] of entries) {
        cursor -= weight;
        if (cursor <= 0) {
          return key;
        }
      }
      return entries[entries.length - 1][0];
    },

    chance(probability) {
      return Math.random() < probability;
    },
  };
})(window.AutoBattler = window.AutoBattler || {});
