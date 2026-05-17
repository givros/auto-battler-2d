(function (AB) {
  class TraitPanel {
    constructor(node, assets) {
      this.node = node;
      this.assets = assets;
    }

    render(rows) {
      AB.dom.clear(this.node);
      rows.forEach((row) => {
        const item = AB.dom.create("div", `trait-row ${row.tier > 0 ? "is-active" : ""}`);
        const icon = AB.dom.create("img", "trait-icon");
        icon.src = this.assets.icons[row.icon];
        icon.alt = "";
        const copy = AB.dom.create("div");
        const name = AB.dom.create("strong", "trait-name", row.name);
        const progress = AB.dom.create(
          "span",
          "trait-progress",
          `${row.count} / ${row.thresholds.join(" / ")}`,
        );
        copy.append(name, progress);
        item.append(icon, copy);
        this.node.append(item);
      });
    }
  }

  AB.TraitPanel = TraitPanel;
})(window.AutoBattler = window.AutoBattler || {});
