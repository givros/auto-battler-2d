(function (AB) {
  class Tooltip {
    constructor(node) {
      this.node = node;
    }

    show(html, x, y) {
      this.node.innerHTML = html;
      this.node.style.left = `${x + 14}px`;
      this.node.style.top = `${y + 14}px`;
      this.node.classList.add("is-visible");
    }

    move(x, y) {
      this.node.style.left = `${x + 14}px`;
      this.node.style.top = `${y + 14}px`;
    }

    hide() {
      this.node.classList.remove("is-visible");
    }
  }

  AB.Tooltip = Tooltip;
})(window.AutoBattler = window.AutoBattler || {});
