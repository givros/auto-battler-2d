(function (AB) {
  class BenchUI {
    constructor(node, game, tooltip) {
      this.node = node;
      this.game = game;
      this.tooltip = tooltip;
      this.dragDrop = null;
    }

    setDragDrop(dragDrop) {
      this.dragDrop = dragDrop;
    }

    render(bench) {
      AB.dom.clear(this.node);
      bench.slots.forEach((unit, index) => {
        const slot = AB.dom.create("div", "bench-slot");
        if (unit) {
          const wrapper = AB.dom.create("div", "bench-unit");
          const stars = AB.dom.create("span", "bench-stars", "★".repeat(unit.starLevel));
          const canvas = document.createElement("canvas");
          canvas.width = 72;
          canvas.height = 58;
          const sprite = this.game.assets.portraits[unit.unitId].back;
          const scale = Math.min(1.08, 52 / sprite.height);
          canvas.getContext("2d").drawImage(
            sprite,
            (canvas.width - sprite.width * scale) / 2,
            canvas.height - sprite.height * scale,
            sprite.width * scale,
            sprite.height * scale,
          );
          wrapper.append(canvas);
          wrapper.addEventListener("pointerdown", (event) => this.dragDrop.beginBenchDrag(unit, index, event));
          wrapper.addEventListener("pointerenter", (event) => this.showTooltip(unit, event));
          wrapper.addEventListener("pointermove", (event) => this.tooltip.move(event.clientX, event.clientY));
          wrapper.addEventListener("pointerleave", () => this.tooltip.hide());
          slot.append(stars, wrapper);
        }
        this.node.append(slot);
      });
    }

    showTooltip(unit, event) {
      const config = unit.baseStats;
      this.tooltip.show(
        `<strong>${unit.name} ${"★".repeat(unit.starLevel)}</strong><br>
        ${config.className} · ${config.origin}<br>
        HP ${Math.round(config.hp * unit.getStarMultiplier())} · ATK ${Math.round(config.attackDamage * unit.getStarMultiplier())}<br>
        <em>${config.ability.name}</em>: ${config.ability.description}`,
        event.clientX,
        event.clientY,
      );
    }
  }

  AB.BenchUI = BenchUI;
})(window.AutoBattler = window.AutoBattler || {});
