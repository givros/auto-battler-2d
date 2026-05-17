(function (AB) {
  AB.TRAIT_CONFIG = {
    Warrior: {
      icon: "sword",
      thresholds: [2, 4, 6],
      description: "Warriors gain bonus armor.",
    },
    Mage: {
      icon: "magic",
      thresholds: [2, 4],
      description: "Mages gain bonus ability power.",
    },
    Assassin: {
      icon: "dagger",
      thresholds: [2, 4],
      description: "Assassins gain critical chance.",
    },
    Guardian: {
      icon: "shield",
      thresholds: [2, 4],
      description: "Guardians gain a combat-start shield.",
    },
    Elf: {
      icon: "leaf",
      thresholds: [2, 4],
      description: "Elves gain dodge chance.",
    },
    Undead: {
      icon: "skull",
      thresholds: [2, 4],
      description: "Undead reduce enemy armor.",
    },
  };
})(window.AutoBattler = window.AutoBattler || {});
