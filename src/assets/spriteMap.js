(function (AB) {
  const columns = {
    idle: { x: 82, y: 0, width: 225 },
    attack: { x: 308, y: 0, width: 270 },
    defend: { x: 579, y: 0, width: 270 },
    death: { x: 850, y: 0, width: 270 },
  };

  const rows = {
    knightFront: { y: 40, height: 151 },
    knightBack: { y: 191, height: 145 },
    archerFront: { y: 336, height: 150 },
    archerBack: { y: 486, height: 144 },
    mageFront: { y: 630, height: 148 },
    mageBack: { y: 778, height: 146 },
    dwarfFront: { y: 924, height: 153 },
    assassinFront: { y: 1077, height: 141 },
    assassinBack: { y: 1218, height: 150 },
  };

  function rowStates(rowKey) {
    return Object.fromEntries(
      Object.entries(columns).map(([state, column]) => [
        state,
        {
          x: column.x,
          y: rows[rowKey].y,
          width: column.width,
          height: rows[rowKey].height,
        },
      ]),
    );
  }

  AB.SPRITE_MAP = {
    knight: {
      front: rowStates("knightFront"),
      back: rowStates("knightBack"),
    },
    archer: {
      front: rowStates("archerFront"),
      back: rowStates("archerBack"),
    },
    mage: {
      front: rowStates("mageFront"),
      back: rowStates("mageBack"),
    },
    dwarf: {
      front: rowStates("dwarfFront"),
      back: rowStates("dwarfFront"),
      usesFallbackBackView: true,
    },
    assassin: {
      front: rowStates("assassinFront"),
      back: rowStates("assassinBack"),
    },
  };
})(window.AutoBattler = window.AutoBattler || {});
