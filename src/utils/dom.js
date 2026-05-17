(function (AB) {
  AB.dom = {
    clear(node) {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    },

    create(tag, className, text) {
      const node = document.createElement(tag);
      if (className) {
        node.className = className;
      }
      if (text) {
        node.textContent = text;
      }
      return node;
    },
  };
})(window.AutoBattler = window.AutoBattler || {});
