(function (AB) {
  window.addEventListener("DOMContentLoaded", async () => {
    const assets = await new AB.AssetLoader().load();
    const game = new AB.Game(assets);
    window.autoBattlerGame = game;
    game.start();
  });
})(window.AutoBattler = window.AutoBattler || {});
