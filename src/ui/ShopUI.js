(function (AB) {
  class ShopUI {
    constructor(node, game, tooltip) {
      this.node = node;
      this.game = game;
      this.tooltip = tooltip;
    }

    render(cards) {
      AB.dom.clear(this.node);
      cards.forEach((unitId, index) => {
        const config = AB.UNIT_CONFIG[unitId];
        const card = AB.dom.create("button", "shop-card");
        card.dataset.rarity = config.rarity;
        card.type = "button";
        card.addEventListener("click", () => this.game.buyUnit(unitId, index));

        const portrait = document.createElement("canvas");
        portrait.width = 120;
        portrait.height = 88;
        const sprite = this.game.assets.portraits[unitId].front;
        const scale = Math.min(1.08, 78 / sprite.height);
        portrait.getContext("2d").drawImage(
          sprite,
          (portrait.width - sprite.width * scale) / 2,
          portrait.height - sprite.height * scale,
          sprite.width * scale,
          sprite.height * scale,
        );

        const name = AB.dom.create("span", "shop-name", config.name);
        const meta = AB.dom.create("span", "shop-meta", config.className);
        const traits = AB.dom.create("span", "shop-traits", config.origin);
        const cost = AB.dom.create("span", "shop-cost");
        const coin = AB.dom.create("img");
        coin.src = this.game.assets.icons.coin;
        coin.alt = "";
        cost.append(coin, document.createTextNode(config.cost));
        card.append(portrait, name, meta, traits, cost);
        card.addEventListener("pointerenter", (event) => this.showTooltip(config, event));
        card.addEventListener("pointermove", (event) => this.tooltip.move(event.clientX, event.clientY));
        card.addEventListener("pointerleave", () => this.tooltip.hide());
        this.node.append(card);
      });
    }

    showTooltip(config, event) {
      this.tooltip.show(
        `<strong>${config.name}</strong><br>
        ${config.rarity} · ${config.className} · ${config.origin}<br>
        HP ${config.hp} · ATK ${config.attackDamage} · Armor ${config.armor}<br>
        <em>${config.ability.name}</em>: ${config.ability.description}`,
        event.clientX,
        event.clientY,
      );
    }
  }

  AB.ShopUI = ShopUI;
})(window.AutoBattler = window.AutoBattler || {});
