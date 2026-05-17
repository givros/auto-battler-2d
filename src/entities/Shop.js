(function (AB) {
  class Shop {
    constructor(owner) {
      this.owner = owner;
      this.cards = [];
    }

    refresh() {
      this.cards = Array.from({ length: AB.SHOP_CONFIG.slots }, () => this.rollUnitId());
    }

    rollUnitId() {
      const odds = AB.SHOP_CONFIG.rarityOddsByLevel[this.owner.level] || AB.SHOP_CONFIG.rarityOddsByLevel[8];
      const rarity = AB.random.weightedPick(odds);
      const candidates = Object.values(AB.UNIT_CONFIG)
        .filter((unit) => unit.rarity === rarity)
        .map((unit) => unit.id);
      return AB.random.pick(candidates);
    }
  }

  AB.Shop = Shop;
})(window.AutoBattler = window.AutoBattler || {});
