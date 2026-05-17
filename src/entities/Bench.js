(function (AB) {
  class Bench {
    constructor(size) {
      this.slots = Array.from({ length: size }, () => null);
    }

    get hasSpace() {
      return this.slots.some((slot) => slot === null);
    }

    add(unit) {
      const index = this.slots.findIndex((slot) => slot === null);
      if (index === -1) {
        return -1;
      }
      this.slots[index] = unit;
      unit.location = "bench";
      unit.benchIndex = index;
      return index;
    }

    remove(index) {
      const unit = this.slots[index];
      this.slots[index] = null;
      if (unit) {
        unit.benchIndex = null;
      }
      return unit;
    }

    removeUnit(unit) {
      const index = this.slots.indexOf(unit);
      if (index >= 0) {
        return this.remove(index);
      }
      return null;
    }

    compact() {
      const units = this.slots.filter(Boolean);
      this.slots = Array.from({ length: this.slots.length }, (_, index) => units[index] || null);
      this.slots.forEach((unit, index) => {
        if (unit) {
          unit.benchIndex = index;
        }
      });
    }

    allUnits() {
      return this.slots.filter(Boolean);
    }
  }

  AB.Bench = Bench;
})(window.AutoBattler = window.AutoBattler || {});
