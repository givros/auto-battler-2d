(function (AB) {
  class HealthPanel {
    constructor() {
      this.playerBar = document.getElementById("player-hp-bar");
      this.aiBar = document.getElementById("ai-hp-bar");
      this.playerValue = document.getElementById("player-hp-value");
      this.aiValue = document.getElementById("ai-hp-value");
      this.history = document.getElementById("round-history");
    }

    render(player, ai, history) {
      this.playerBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
      this.aiBar.style.width = `${(ai.hp / ai.maxHp) * 100}%`;
      this.playerValue.textContent = player.hp;
      this.aiValue.textContent = ai.hp;
      AB.dom.clear(this.history);
      history.slice(-7).forEach((entry) => {
        const item = AB.dom.create("li", "", entry);
        this.history.append(item);
      });
    }
  }

  AB.HealthPanel = HealthPanel;
})(window.AutoBattler = window.AutoBattler || {});
