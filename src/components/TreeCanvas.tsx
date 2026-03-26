/* eslint-disable react-hooks/unsupported-syntax */

import { useEffect, useRef } from 'react';
import P5 from 'p5';

type LeafColor = 'green' | 'pink' | 'yellow' | 'orange';

type TreeCanvasProps = {
  numTrees: number;
  minBranchLength: number;
  initialHeight: number;
  leafScale: number;
  windIntensity: number;
  seed: string;
};

type BranchOptions = {
  color?: LeafColor;
  leafScale: number;
  minBranchLength: number;
};

type PendingZone = {
  x: number;
  y: number;
  w: number;
  h: number;
  options: BranchOptions;
};

const LEAF_COLORS: LeafColor[] = ['green', 'pink', 'yellow', 'orange'];

const LEAF_SPRITE_COLORS: Record<
  LeafColor,
  { base: string; detail: string; stem: string; vein: string }
> = {
  green: {
    base: '#749600',
    detail: '#8bb800',
    stem: '#5d6800',
    vein: '#659000',
  },
  pink: {
    base: '#ff66b2',
    detail: '#ff99cc',
    stem: '#cc0066',
    vein: '#ff3399',
  },
  yellow: {
    base: '#ffd700',
    detail: '#ffeb3b',
    stem: '#b8860b',
    vein: '#daa520',
  },
  orange: {
    base: '#ff8c00',
    detail: '#ffa500',
    stem: '#d2691e',
    vein: '#ff7f50',
  },
};

function hashSeed(seed: string) {
  let value = 0;

  for (let index = 0; index < seed.length; index += 1) {
    value = Math.imul(31, value) + seed.charCodeAt(index) | 0;
  }

  return Math.abs(value);
}

function TreeCanvas(props: TreeCanvasProps) {
  const {
    initialHeight,
    leafScale,
    minBranchLength,
    numTrees,
    seed,
    windIntensity,
  } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<P5 | null>(null);
  const latestConfigRef = useRef(props);
  const rebuildForestRef = useRef<null | (() => void)>(null);
  const syncLeafScaleRef = useRef<null | ((nextLeafScale: number) => void)>(null);

  useEffect(() => {
    const previous = latestConfigRef.current;
    const shouldRebuild =
      previous.numTrees !== numTrees ||
      previous.minBranchLength !== minBranchLength ||
      previous.initialHeight !== initialHeight ||
      previous.seed !== seed;

    latestConfigRef.current = {
      initialHeight,
      leafScale,
      minBranchLength,
      numTrees,
      seed,
      windIntensity,
    };

    if (shouldRebuild) {
      rebuildForestRef.current?.();
      return;
    }

    if (previous.leafScale !== leafScale) {
      syncLeafScaleRef.current?.(leafScale);
    }
  }, [initialHeight, leafScale, minBranchLength, numTrees, seed, windIntensity]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const sketch = (instance: P5) => {
      const leafSprites: Partial<Record<LeafColor, P5.Graphics>> = {};
      let forest: Branch[] = [];
      let activeZones: Array<PendingZone & { selectedColor: LeafColor; tree: Branch }> = [];
      let pendingZones: PendingZone[] = [];
      let swayTime = 0;
      let isDragging = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let dragEndX = 0;
      let dragEndY = 0;
      let boundsMinX = 0;
      let boundsMaxX = 0;
      let boundsMinY = 0;
      let boundsMaxY = 0;

      class Branch {
        public angle: number;

        public angleOffset: number;

        public blastForce = 0;

        public branchA: Branch | null = null;

        public branchB: Branch | null = null;

        public growth = 0;

        public length: number;

        public options: BranchOptions;

        public parent: Branch | null;

        public windForce = 0;

        public x: number;

        public y: number;

        constructor(
          parent: Branch | null,
          x: number,
          y: number,
          angleOffset: number,
          length: number,
          options?: BranchOptions,
        ) {
          this.parent = parent;
          this.options =
            options ??
            (parent
              ? parent.options
              : {
                  leafScale: latestConfigRef.current.leafScale,
                  minBranchLength: latestConfigRef.current.minBranchLength,
                });
          this.x = x;
          this.y = y;
          this.length = length;

          if (parent) {
            this.angle = parent.angle + angleOffset;
            this.angleOffset = angleOffset;
          } else {
            this.angle = angleOffset;
            this.angleOffset = -0.2 + instance.random(0.4);
          }

          const endX = x + instance.sin(this.angle) * length;
          const endY = y + instance.cos(this.angle) * length;

          if (length > this.options.minBranchLength) {
            if (length + instance.random(length * 10) > 30) {
              const leftOffset =
                -0.1 -
                instance.random(0.4) +
                (this.angle % instance.TWO_PI > instance.PI ? -1 / length : 1 / length);

              this.branchA = new Branch(
                this,
                endX,
                endY,
                leftOffset,
                length * (0.6 + instance.random(0.3)),
                this.options,
              );
            }

            if (length + instance.random(length * 10) > 30) {
              const rightOffset =
                0.1 +
                instance.random(0.4) +
                (this.angle % instance.TWO_PI > instance.PI ? -1 / length : 1 / length);

              this.branchB = new Branch(
                this,
                endX,
                endY,
                rightOffset,
                length * (0.6 + instance.random(0.3)),
                this.options,
              );
            }

            if (this.branchB && !this.branchA) {
              this.branchA = this.branchB;
              this.branchB = null;
            }
          }

          boundsMinX = instance.min(endX, boundsMinX);
          boundsMaxX = instance.max(endX, boundsMaxX);
          boundsMinY = instance.min(endY, boundsMinY);
          boundsMaxY = instance.max(endY, boundsMaxY);
        }

        isFullyGrown(): boolean {
          return !(
            this.growth < 1 ||
            (this.branchA && !this.branchA.isFullyGrown()) ||
            (this.branchB && !this.branchB.isFullyGrown())
          );
        }

        render(): void {
          if (this.branchA) {
            let controlX = this.x;
            let controlY = this.y;

            if (this.parent) {
              controlX += (this.x - this.parent.x) * 0.4;
              controlY += (this.y - this.parent.y) * 0.4;
            } else {
              controlX += instance.sin(this.angle + this.angleOffset) * this.length * 0.3;
              controlY += instance.cos(this.angle + this.angleOffset) * this.length * 0.3;
            }

            const strokeShade = instance.floor(1100 / this.length);

            instance.stroke(strokeShade);
            instance.strokeWeight(this.length / 5);
            instance.noFill();
            instance.bezier(
              this.x,
              this.y,
              controlX,
              controlY,
              controlX,
              controlY,
              this.branchA.x,
              this.branchA.y,
            );

            this.branchA.render();
            this.branchB?.render();

            return;
          }

          instance.push();
          instance.translate(this.x, this.y);
          instance.rotate(-this.angle);

          const sprite = leafSprites[this.options.color ?? 'green'];

          if (sprite) {
            const scale = this.options.leafScale;

            instance.image(
              sprite,
              -(sprite.width * scale) / 2,
              0,
              sprite.width * scale,
              sprite.height * scale,
            );
          }

          instance.pop();
        }

        setScale(scale: number): void {
          this.length *= scale;
          this.branchA?.setScale(scale);
          this.branchB?.setScale(scale);
        }

        update(windForce: number): void {
          if (this.parent) {
            this.x =
              this.parent.x +
              instance.sin(this.parent.angle) * this.parent.length * this.parent.growth;
            this.y =
              this.parent.y +
              instance.cos(this.parent.angle) * this.parent.length * this.parent.growth;
            this.windForce = this.parent.windForce * (1 + 5 / this.length) + this.blastForce;
            this.blastForce =
              (this.blastForce + instance.sin(this.x / 2 + swayTime) * 0.005 / this.length) *
              0.98;
            this.angle =
              this.parent.angle + this.angleOffset + this.windForce + this.blastForce;
            this.growth = instance.min(this.growth + 0.1 * this.parent.growth, 1);
          } else {
            this.windForce = windForce;
            this.growth = instance.min(this.growth + 0.1, 1);
          }

          this.branchA?.update(windForce);
          this.branchB?.update(windForce);
        }
      }

      const createLeafSprite = (
        baseColor: string,
        detailColor: string,
        stemColor: string,
        veinColor: string,
      ) => {
        const sprite = instance.createGraphics(12, 18);

        sprite.background(0, 0);
        sprite.stroke(stemColor);
        sprite.line(6, 0, 6, 6);
        sprite.noStroke();
        sprite.fill(baseColor);
        sprite.ellipse(6, 12, 12, 12);
        sprite.fill(detailColor);
        sprite.ellipse(6, 12, 8, 10);
        sprite.stroke(veinColor);
        sprite.noFill();
        sprite.line(6, 6, 6, 15);

        return sprite;
      };

      const drawPalette = (
        x: number,
        y: number,
        width: number,
        selectedColor?: LeafColor,
      ) => {
        const paletteY = y - 20;
        const paletteStartX = x + width / 2 - 48;

        instance.push();

        LEAF_COLORS.forEach((color, index) => {
          const colorConfig = LEAF_SPRITE_COLORS[color];
          const paletteX = paletteStartX + index * 32;

          instance.fill(colorConfig.base);
          instance.stroke(255);
          instance.strokeWeight(2);
          instance.circle(paletteX, paletteY, 24);

          if (selectedColor === color) {
            instance.stroke(255);
            instance.strokeWeight(2);
            instance.noFill();
            instance.beginShape();
            instance.vertex(paletteX - 4, paletteY);
            instance.vertex(paletteX - 1, paletteY + 4);
            instance.vertex(paletteX + 5, paletteY - 3);
            instance.endShape();
          }
        });

        instance.pop();
      };

      const rebuildForest = () => {
        forest = [];
        activeZones = [];
        pendingZones = [];

        instance.randomSeed(hashSeed(latestConfigRef.current.seed));

        for (let treeIndex = 0; treeIndex < latestConfigRef.current.numTrees; treeIndex += 1) {
          boundsMinX = instance.width / 2;
          boundsMaxX = instance.width / 2;
          boundsMinY = instance.height;
          boundsMaxY = instance.height;

          const rootX =
            (instance.width / (latestConfigRef.current.numTrees + 1)) * (treeIndex + 1);
          const rootTree = new Branch(
            null,
            rootX,
            instance.height,
            instance.PI,
            latestConfigRef.current.initialHeight,
          );
          const widthSpan = boundsMaxX - boundsMinX;
          const heightSpan = boundsMaxY - boundsMinY;
          const maxSize = instance.min(instance.width, instance.height) * 0.7;
          let scale = 1;

          if (widthSpan > heightSpan) {
            if (widthSpan > maxSize) {
              scale = maxSize / widthSpan;
            }
          } else if (heightSpan > maxSize) {
            scale = maxSize / heightSpan;
          }

          rootTree.setScale(scale);
          rootTree.x = rootX - (widthSpan / 2) * scale + (rootTree.x - boundsMinX) * scale;
          rootTree.y = instance.height + (rootTree.y - boundsMaxY) * scale;

          forest.push(rootTree);
        }
      };

      const resizeToContainer = () => {
        const width = containerRef.current?.clientWidth || 600;
        const height = containerRef.current?.clientHeight || 600;

        instance.resizeCanvas(width, height);
      };

      const syncLeafScale = (nextLeafScale: number) => {
        forest.forEach((tree) => {
          tree.options.leafScale = nextLeafScale;
        });

        pendingZones.forEach((zone) => {
          zone.options.leafScale = nextLeafScale;
        });

        activeZones.forEach((zone) => {
          zone.options.leafScale = nextLeafScale;
          zone.tree.options.leafScale = nextLeafScale;
        });
      };

      rebuildForestRef.current = rebuildForest;
      syncLeafScaleRef.current = syncLeafScale;

      instance.setup = () => {
        const width = containerRef.current?.clientWidth || 600;
        const height = containerRef.current?.clientHeight || 600;

        instance.createCanvas(width, height).parent(container);

        LEAF_COLORS.forEach((color) => {
          const spriteColors = LEAF_SPRITE_COLORS[color];

          leafSprites[color] = createLeafSprite(
            spriteColors.base,
            spriteColors.detail,
            spriteColors.stem,
            spriteColors.vein,
          );
        });

        rebuildForest();
      };

      instance.draw = () => {
        const drawingContext = instance.drawingContext as CanvasRenderingContext2D;

        instance.clear();
        swayTime += 0.003 * latestConfigRef.current.windIntensity;

        const windForce =
          instance.sin(swayTime) * 0.02 * latestConfigRef.current.windIntensity;

        forest.forEach((tree) => {
          tree.update(windForce);
          tree.render();
        });

        instance.push();
        instance.stroke(255);
        instance.strokeWeight(2);
        instance.noFill();
        drawingContext.setLineDash([5, 5]);

        if (isDragging) {
          instance.rect(
            instance.min(dragStartX, dragEndX),
            instance.min(dragStartY, dragEndY),
            instance.abs(dragEndX - dragStartX),
            instance.abs(dragEndY - dragStartY),
          );
        }

        pendingZones.forEach((zone) => {
          instance.rect(zone.x, zone.y, zone.w, zone.h);
        });

        for (let zoneIndex = activeZones.length - 1; zoneIndex >= 0; zoneIndex -= 1) {
          const zone = activeZones[zoneIndex];

          if (zone.tree.isFullyGrown()) {
            activeZones.splice(zoneIndex, 1);
            continue;
          }

          instance.rect(zone.x, zone.y, zone.w, zone.h);
        }

        drawingContext.setLineDash([]);
        instance.pop();

        pendingZones.forEach((zone) => {
          drawPalette(zone.x, zone.y, zone.w);
        });

        activeZones.forEach((zone) => {
          drawPalette(zone.x, zone.y, zone.w, zone.selectedColor);
        });
      };

      instance.mouseDragged = () => {
        if (!isDragging) {
          return;
        }

        dragEndX = instance.mouseX;
        dragEndY = instance.mouseY;
      };

      instance.mousePressed = (event?: MouseEvent) => {
        const target = event?.target as HTMLElement | null;

        if (target?.tagName?.toLowerCase() !== 'canvas') {
          return;
        }

        for (let zoneIndex = pendingZones.length - 1; zoneIndex >= 0; zoneIndex -= 1) {
          const zone = pendingZones[zoneIndex];
          const paletteY = zone.y - 20;
          const paletteStartX = zone.x + zone.w / 2 - 48;

          for (let colorIndex = 0; colorIndex < LEAF_COLORS.length; colorIndex += 1) {
            const color = LEAF_COLORS[colorIndex];
            const paletteX = paletteStartX + colorIndex * 32;

            if (instance.dist(instance.mouseX, instance.mouseY, paletteX, paletteY) > 12) {
              continue;
            }

            const selectedTree = new Branch(
              null,
              zone.x + zone.w / 2,
              zone.y + zone.h,
              instance.PI,
              zone.h / 3.5,
              {
                ...zone.options,
                color,
              },
            );

            selectedTree.setScale(1);
            forest.push(selectedTree);
            activeZones.push({
              ...zone,
              selectedColor: color,
              tree: selectedTree,
            });
            pendingZones.splice(zoneIndex, 1);

            return;
          }
        }

        if (
          instance.mouseX < 0 ||
          instance.mouseX > instance.width ||
          instance.mouseY < 0 ||
          instance.mouseY > instance.height
        ) {
          return;
        }

        isDragging = true;
        dragStartX = instance.mouseX;
        dragStartY = instance.mouseY;
        dragEndX = instance.mouseX;
        dragEndY = instance.mouseY;
      };

      instance.mouseReleased = () => {
        if (!isDragging) {
          return;
        }

        isDragging = false;

        const width = instance.abs(dragEndX - dragStartX);
        const height = instance.abs(dragEndY - dragStartY);

        if (width <= 10 || height <= 10) {
          return;
        }

        pendingZones.push({
          h: height,
          options: {
            leafScale: instance.random(0.5, 2),
            minBranchLength: instance.random(10, 35),
          },
          w: width,
          x: instance.min(dragStartX, dragEndX),
          y: instance.min(dragStartY, dragEndY),
        });
      };

      instance.windowResized = () => {
        resizeToContainer();
        rebuildForest();
      };
    };

    sceneRef.current = new P5(sketch, container);

    return () => {
      rebuildForestRef.current = null;
      syncLeafScaleRef.current = null;
      sceneRef.current?.remove();
      sceneRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="canvas-surface" />;
}

export default TreeCanvas;
