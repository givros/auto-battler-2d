(function (AB) {
  class AssetLoader {
    constructor() {
      this.sprites = {};
      this.portraits = {};
      this.icons = AB.GeneratedAssets.createIconSet();
      this.backgrounds = {};
      this.sheet = null;
    }

    async load() {
      [this.sheet, this.backgrounds.arena] = await Promise.all([
        this.loadImage("./character_spritesheet.png"),
        this.loadImage("./assets/backgrounds/arena-background.png"),
      ]);
      Object.entries(AB.SPRITE_MAP).forEach(([unitId, views]) => {
        this.sprites[unitId] = {};
        this.portraits[unitId] = {};
        ["front", "back"].forEach((view) => {
          const extracted = {};
          Object.entries(views[view]).forEach(([state, rect]) => {
            extracted[state] = this.extractTransparentSprite(rect);
          });
          this.portraits[unitId][view] = extracted.idle;
          this.sprites[unitId][view] = this.normalizeStateSet(extracted);
        });
      });
      return this;
    }

    loadImage(src) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
      });
    }

    extractTransparentSprite(rect) {
      const raw = document.createElement("canvas");
      raw.width = rect.width;
      raw.height = rect.height;
      const rawCtx = raw.getContext("2d", { willReadFrequently: true });
      rawCtx.drawImage(
        this.sheet,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        0,
        0,
        rect.width,
        rect.height,
      );

      const imageData = rawCtx.getImageData(0, 0, raw.width, raw.height);
      this.clearConnectedBackground(imageData, raw.width, raw.height);
      this.clearGuideLines(imageData, raw.width, raw.height);
      rawCtx.putImageData(imageData, 0, 0);

      return this.trimCanvas(raw);
    }

    clearConnectedBackground(imageData, width, height) {
      const pixels = imageData.data;
      const visited = new Uint8Array(width * height);
      const queue = [];
      let cursor = 0;
      const push = (x, y) => {
        const key = y * width + x;
        if (visited[key]) {
          return;
        }
        visited[key] = 1;
        queue.push({ x, y });
      };

      for (let x = 0; x < width; x += 1) {
        push(x, 0);
        push(x, height - 1);
      }
      for (let y = 0; y < height; y += 1) {
        push(0, y);
        push(width - 1, y);
      }

      while (cursor < queue.length) {
        const { x, y } = queue[cursor];
        cursor += 1;
        const pixelIndex = (y * width + x) * 4;
        if (!this.isBackgroundPixel(pixels, pixelIndex)) {
          continue;
        }
        pixels[pixelIndex + 3] = 0;
        if (x > 0) {
          push(x - 1, y);
        }
        if (x < width - 1) {
          push(x + 1, y);
        }
        if (y > 0) {
          push(x, y - 1);
        }
        if (y < height - 1) {
          push(x, y + 1);
        }
      }
    }

    isBackgroundPixel(pixels, index) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      return brightest > 214 && darkest > 204 && brightest - darkest < 20;
    }

    clearGuideLines(imageData, width, height) {
      const pixels = imageData.data;
      const shouldClear = (index) => {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const brightest = Math.max(red, green, blue);
        const darkest = Math.min(red, green, blue);
        return brightest > 230 && darkest > 220 && brightest - darkest < 18;
      };

      for (let y = 0; y < height; y += 1) {
        let brightCount = 0;
        for (let x = 0; x < width; x += 1) {
          if (shouldClear((y * width + x) * 4)) {
            brightCount += 1;
          }
        }
        if (brightCount / width > 0.74) {
          for (let x = 0; x < width; x += 1) {
            const index = (y * width + x) * 4;
            if (shouldClear(index)) {
              pixels[index + 3] = 0;
            }
          }
        }
      }

      for (let x = 0; x < width; x += 1) {
        let brightCount = 0;
        for (let y = 0; y < height; y += 1) {
          if (shouldClear((y * width + x) * 4)) {
            brightCount += 1;
          }
        }
        if (brightCount / height > 0.74) {
          for (let y = 0; y < height; y += 1) {
            const index = (y * width + x) * 4;
            if (shouldClear(index)) {
              pixels[index + 3] = 0;
            }
          }
        }
      }
    }

    trimCanvas(source) {
      const ctx = source.getContext("2d", { willReadFrequently: true });
      const data = ctx.getImageData(0, 0, source.width, source.height).data;
      let minX = source.width;
      let minY = source.height;
      let maxX = 0;
      let maxY = 0;

      for (let y = 0; y < source.height; y += 1) {
        for (let x = 0; x < source.width; x += 1) {
          const alpha = data[(y * source.width + x) * 4 + 3];
          if (alpha > 0) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      const trimmed = document.createElement("canvas");
      trimmed.width = Math.max(1, maxX - minX + 1);
      trimmed.height = Math.max(1, maxY - minY + 1);
      trimmed
        .getContext("2d")
        .drawImage(source, minX, minY, trimmed.width, trimmed.height, 0, 0, trimmed.width, trimmed.height);
      return trimmed;
    }

    normalizeStateSet(states) {
      const maxWidth = Math.max(...Object.values(states).map((canvas) => canvas.width));
      const maxHeight = Math.max(...Object.values(states).map((canvas) => canvas.height));
      return Object.fromEntries(
        Object.entries(states).map(([state, canvas]) => {
          const normalized = document.createElement("canvas");
          normalized.width = maxWidth;
          normalized.height = maxHeight;
          normalized.getContext("2d").drawImage(
            canvas,
            Math.round((maxWidth - canvas.width) / 2),
            maxHeight - canvas.height,
          );
          return [state, normalized];
        }),
      );
    }
  }

  AB.AssetLoader = AssetLoader;
})(window.AutoBattler = window.AutoBattler || {});
