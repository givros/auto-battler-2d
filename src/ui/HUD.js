(function (AB) {
  class HUD {
    constructor(game) {
      this.game = game;
      this.roundValue = document.getElementById("round-value");
      this.phaseValue = document.getElementById("phase-value");
      this.timerValue = document.getElementById("timer-value");
      this.goldValue = document.getElementById("gold-value");
      this.levelValue = document.getElementById("level-value");
      this.xpBar = document.getElementById("xp-bar");
      this.xpValue = document.getElementById("xp-value");
      this.incomeBreakdown = document.getElementById("income-breakdown");
      this.actionButton = document.getElementById("phase-action-button");
      this.banner = document.getElementById("board-banner");
      this.buyXpButton = document.getElementById("buy-xp-button");
      this.refreshButton = document.getElementById("refresh-button");
      this.resetButton = document.getElementById("reset-button");
      this.toastStack = document.getElementById("toast-stack");
      this.gameOver = document.getElementById("game-over");
      this.gameOverTitle = document.getElementById("game-over-title");
      this.gameOverCopy = document.getElementById("game-over-copy");
      this.playAgainButton = document.getElementById("play-again-button");
      this.speedButtons = Array.from(document.querySelectorAll(".speed-button"));
      this.bind();
    }

    bind() {
      this.actionButton.addEventListener("click", () => {
        if (this.game.phase === "Placement") {
          this.game.startCombat();
        } else if (this.game.phase === "Reward") {
          this.game.nextRound();
        }
      });
      this.buyXpButton.addEventListener("click", () => this.game.buyXp());
      this.refreshButton.addEventListener("click", () => this.game.refreshShop());
      this.resetButton.addEventListener("click", () => this.game.reset());
      this.playAgainButton.addEventListener("click", () => this.game.reset());
      this.speedButtons.forEach((button) => {
        button.addEventListener("click", () => {
          this.game.combatSpeed = Number(button.dataset.speed);
          this.speedButtons.forEach((item) => item.classList.toggle("is-active", item === button));
        });
      });
    }

    render() {
      const { player, roundSystem } = this.game;
      this.roundValue.textContent = roundSystem.round;
      this.phaseValue.textContent = this.game.phase;
      this.timerValue.textContent = this.game.phase === "Combat"
        ? "Live"
        : this.game.phase === "Reward"
          ? "Ready"
          : `${Math.ceil(roundSystem.phaseTimer)}s`;
      this.goldValue.textContent = player.gold;
      this.levelValue.textContent = player.level;
      const nextXp = player.nextLevelXp;
      const xpRatio = nextXp === 0 ? 1 : player.xp / nextXp;
      this.xpBar.style.width = `${xpRatio * 100}%`;
      this.xpValue.textContent = nextXp === 0 ? "Max level" : `${player.xp} / ${nextXp} XP`;
      this.buyXpButton.disabled = this.game.phase === "Combat";
      this.refreshButton.disabled = this.game.phase === "Combat";

      const income = player.lastIncome;
      this.incomeBreakdown.textContent = income
        ? `Last income: ${income.total} gold = ${income.base} base + ${income.interest} interest + ${income.streak} streak + ${income.resultBonus} result`
        : "Interest: +1 gold per 10 saved, up to +5.";

      if (this.game.phase === "Placement") {
        this.actionButton.textContent = "Start Combat";
        this.actionButton.disabled = false;
      } else if (this.game.phase === "Reward") {
        this.actionButton.textContent = "Next Round";
        this.actionButton.disabled = false;
      } else {
        this.actionButton.textContent = this.game.phase === "Combat" ? "Combat in Progress" : "Start Combat";
        this.actionButton.disabled = true;
      }
    }

    showBanner(text) {
      this.banner.textContent = text;
      this.banner.classList.add("is-visible");
      window.clearTimeout(this.bannerTimeout);
      this.bannerTimeout = window.setTimeout(() => this.banner.classList.remove("is-visible"), 1200);
    }

    toast(message, type = "") {
      const toast = AB.dom.create("div", `toast ${type}`, message);
      this.toastStack.append(toast);
      window.setTimeout(() => toast.remove(), 2600);
    }

    showGameOver(playerWon) {
      this.gameOver.hidden = false;
      this.gameOverTitle.textContent = playerWon ? "Victory" : "Defeat";
      this.gameOverCopy.textContent = playerWon
        ? "The ruins belong to your warband."
        : "The enemy commander outlasted you.";
    }

    hideGameOver() {
      this.gameOver.hidden = true;
    }
  }

  AB.HUD = HUD;
})(window.AutoBattler = window.AutoBattler || {});
