(function (AB) {
  function makeCanvas(size = 32) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    return canvas;
  }

  function drawCoin(ctx, size) {
    const radius = size * 0.34;
    const gradient = ctx.createRadialGradient(size * 0.38, size * 0.3, 2, size / 2, size / 2, radius);
    gradient.addColorStop(0, "#fff0a8");
    gradient.addColorStop(1, "#b8771d");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6d4310";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#6d4310";
    ctx.font = `bold ${size * 0.48}px Georgia`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("G", size / 2, size / 2 + 1);
  }

  function drawSword(ctx, size) {
    ctx.strokeStyle = "#dce7ef";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(size * 0.24, size * 0.76);
    ctx.lineTo(size * 0.76, size * 0.24);
    ctx.stroke();
    ctx.strokeStyle = "#7d5321";
    ctx.beginPath();
    ctx.moveTo(size * 0.2, size * 0.66);
    ctx.lineTo(size * 0.34, size * 0.8);
    ctx.stroke();
  }

  function drawShield(ctx, size) {
    ctx.fillStyle = "#677f96";
    ctx.beginPath();
    ctx.moveTo(size * 0.5, size * 0.14);
    ctx.lineTo(size * 0.78, size * 0.25);
    ctx.lineTo(size * 0.74, size * 0.62);
    ctx.quadraticCurveTo(size * 0.5, size * 0.86, size * 0.26, size * 0.62);
    ctx.lineTo(size * 0.22, size * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#d3b16c";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawMagic(ctx, size) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size * 0.34);
    gradient.addColorStop(0, "#f6dbff");
    gradient.addColorStop(1, "#8a3cff");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawLeaf(ctx, size) {
    ctx.fillStyle = "#69d77f";
    ctx.beginPath();
    ctx.moveTo(size * 0.18, size * 0.68);
    ctx.quadraticCurveTo(size * 0.36, size * 0.14, size * 0.78, size * 0.2);
    ctx.quadraticCurveTo(size * 0.74, size * 0.62, size * 0.18, size * 0.68);
    ctx.fill();
  }

  function drawSkull(ctx, size) {
    ctx.fillStyle = "#d9d9df";
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.42, size * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(size * 0.34, size * 0.48, size * 0.32, size * 0.22);
    ctx.fillStyle = "#20212a";
    ctx.beginPath();
    ctx.arc(size * 0.42, size * 0.4, size * 0.05, 0, Math.PI * 2);
    ctx.arc(size * 0.58, size * 0.4, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawDagger(ctx, size) {
    ctx.strokeStyle = "#e8e4ee";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(size * 0.32, size * 0.72);
    ctx.lineTo(size * 0.7, size * 0.22);
    ctx.stroke();
    ctx.strokeStyle = "#9b2335";
    ctx.beginPath();
    ctx.moveTo(size * 0.24, size * 0.78);
    ctx.lineTo(size * 0.4, size * 0.66);
    ctx.stroke();
  }

  function iconDataUrl(drawer) {
    const canvas = makeCanvas(32);
    const ctx = canvas.getContext("2d");
    drawer(ctx, 32);
    return canvas.toDataURL();
  }

  function createIconSet() {
    return {
      coin: iconDataUrl(drawCoin),
      xp: iconDataUrl(drawMagic),
      sword: iconDataUrl(drawSword),
      shield: iconDataUrl(drawShield),
      magic: iconDataUrl(drawMagic),
      leaf: iconDataUrl(drawLeaf),
      skull: iconDataUrl(drawSkull),
      dagger: iconDataUrl(drawDagger),
    };
  }

  function drawArenaBackdrop(ctx, width, height, backgroundImage) {
    if (backgroundImage) {
      drawCoverImage(ctx, backgroundImage, width, height);
      const vignette = ctx.createLinearGradient(0, 0, 0, height);
      vignette.addColorStop(0, "rgba(8, 14, 18, 0.16)");
      vignette.addColorStop(0.55, "rgba(8, 14, 18, 0.03)");
      vignette.addColorStop(1, "rgba(8, 14, 18, 0.18)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#1e3d45");
    sky.addColorStop(0.32, "#244738");
    sky.addColorStop(1, "#101713");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#102b2c";
    ctx.beginPath();
    ctx.moveTo(width * 0.78, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height * 0.58);
    ctx.lineTo(width * 0.88, height * 0.66);
    ctx.closePath();
    ctx.fill();

    const waterfall = ctx.createLinearGradient(width * 0.86, 0, width, 0);
    waterfall.addColorStop(0, "rgba(91, 183, 209, 0)");
    waterfall.addColorStop(0.35, "rgba(101, 208, 232, 0.75)");
    waterfall.addColorStop(1, "rgba(214, 250, 255, 0.95)");
    ctx.fillStyle = waterfall;
    ctx.fillRect(width * 0.87, 0, width * 0.13, height * 0.78);

    ctx.fillStyle = "#173021";
    for (let i = 0; i < 18; i += 1) {
      const x = (i * 67) % width;
      const h = 60 + ((i * 37) % 110);
      ctx.beginPath();
      ctx.moveTo(x, 80);
      ctx.lineTo(x + 36, 80 - h);
      ctx.lineTo(x + 72, 80);
      ctx.closePath();
      ctx.fill();
    }

    drawTorch(ctx, 52, 84);
    drawTorch(ctx, width - 86, 84);
    drawCrystal(ctx, 42, height - 118, "#5ee8ff");
    drawCrystal(ctx, 74, height - 156, "#78f2ff");
    drawCrystal(ctx, width - 54, height - 128, "#8de4ff");
  }

  function drawCoverImage(ctx, image, width, height) {
    const scale = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  }

  function drawTorch(ctx, x, y) {
    ctx.fillStyle = "#6d6552";
    ctx.fillRect(x - 10, y, 20, 54);
    ctx.fillStyle = "#a48859";
    ctx.fillRect(x - 18, y - 8, 36, 12);
    const flame = ctx.createRadialGradient(x, y - 18, 2, x, y - 18, 28);
    flame.addColorStop(0, "#fff3a0");
    flame.addColorStop(0.45, "#ff9c24");
    flame.addColorStop(1, "rgba(255, 102, 0, 0)");
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.arc(x, y - 18, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCrystal(ctx, x, y, color) {
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x + 16, y);
    ctx.lineTo(x + 8, y + 20);
    ctx.lineTo(x - 8, y + 20);
    ctx.lineTo(x - 16, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawTile(ctx, x, y, size, isPlayerSide, pulse = 0) {
    const gradient = ctx.createLinearGradient(x, y, x, y + size);
    gradient.addColorStop(0, isPlayerSide ? "rgba(182, 189, 164, 0.18)" : "rgba(174, 167, 144, 0.16)");
    gradient.addColorStop(1, isPlayerSide ? "rgba(83, 92, 74, 0.14)" : "rgba(75, 72, 61, 0.14)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, size - 2, size - 2);
    ctx.strokeStyle = "rgba(28, 25, 20, 0.56)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size - 2, size - 2);

    if (pulse > 0) {
      ctx.fillStyle = `rgba(122, 238, 164, ${0.12 + pulse * 0.18})`;
      ctx.fillRect(x, y, size - 2, size - 2);
    }
  }

  function drawAttackFx(ctx, effect) {
    ctx.save();
    ctx.globalAlpha = effect.life / effect.maxLife;
    ctx.strokeStyle = effect.color || "#ffe29a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(effect.x1, effect.y1);
    ctx.lineTo(effect.x2, effect.y2);
    ctx.stroke();
    ctx.restore();
  }

  function drawSpellFx(ctx, effect) {
    ctx.save();
    ctx.globalAlpha = effect.life / effect.maxLife;
    ctx.strokeStyle = effect.color || "#a96dff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius * (1 + (1 - effect.life / effect.maxLife)), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function playTone(frequency, duration, volume = 0.03) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }
    const context = playTone.context || new AudioContextClass();
    playTone.context = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  AB.GeneratedAssets = {
    createIconSet,
    drawArenaBackdrop,
    drawTile,
    drawAttackFx,
    drawSpellFx,
    playTone,
  };
})(window.AutoBattler = window.AutoBattler || {});
