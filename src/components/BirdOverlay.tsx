/* eslint-disable react-hooks/unsupported-syntax */

import { useEffect, useRef } from 'react';
import P5 from 'p5';

type BirdOverlayProps = {
  birdAddTrigger: number;
};

function BirdOverlay({ birdAddTrigger }: BirdOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sketchRef = useRef<P5 | null>(null);
  const latestTriggerRef = useRef(birdAddTrigger);

  useEffect(() => {
    latestTriggerRef.current = birdAddTrigger;
  }, [birdAddTrigger]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const sketch = (instance: P5) => {
      const birds: Bird[] = [];
      let lastHandledTrigger = 0;

      class Bird {
        public size: number;

        public speedX: number;

        public speedY: number;

        public wingOffset: number;

        public wingSpeed: number;

        public x: number;

        public y: number;

        constructor(
          fliesRight: boolean,
          y: number,
          speedX: number,
          speedY: number,
          index: number,
        ) {
          this.x = fliesRight
            ? -100 - index * 40
            : instance.width + 100 + index * 40;
          this.y = y + instance.random(-30, 30);
          this.speedX = speedX;
          this.speedY = speedY + instance.random(-0.1, 0.1);
          this.size = instance.random(10, 16);
          this.wingOffset = instance.random(instance.TWO_PI);
          this.wingSpeed = instance.random(0.1, 0.2);
        }

        isOffscreen() {
          return (
            (this.speedX > 0 && this.x > instance.width + 300) ||
            (this.speedX < 0 && this.x < -300) ||
            this.y < -200 ||
            this.y > instance.height + 200
          );
        }

        render() {
          instance.push();
          instance.translate(this.x, this.y);

          if (this.speedX < 0) {
            instance.scale(-1, 1);
          }

          instance.stroke(255);
          instance.strokeWeight(3);
          instance.noFill();

          const wingLift = instance.sin(this.wingOffset) * (this.size * 0.7);

          instance.beginShape();
          instance.vertex(-this.size, -wingLift);
          instance.vertex(0, 0);
          instance.vertex(this.size, -wingLift);
          instance.endShape();
          instance.pop();
        }

        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          this.wingOffset += this.wingSpeed;
        }
      }

      const resizeToContainer = () => {
        const width = containerRef.current?.clientWidth || 800;
        const height = containerRef.current?.clientHeight || 800;

        instance.resizeCanvas(width, height);
      };

      const spawnFlock = () => {
        const flockSize = instance.floor(instance.random(6, 10));
        const fliesRight = instance.random() > 0.5;
        const y = instance.random(instance.height * 0.1, instance.height * 0.4);
        const speedX = (fliesRight ? 1 : -1) * instance.random(2.5, 4.5);
        const speedY = instance.random(-0.2, 0.2);

        for (let index = 0; index < flockSize; index += 1) {
          birds.push(new Bird(fliesRight, y, speedX, speedY, index));
        }
      };

      instance.setup = () => {
        const width = containerRef.current?.clientWidth || 800;
        const height = containerRef.current?.clientHeight || 800;

        instance.createCanvas(width, height).parent(container);
        instance.clear();
      };

      instance.draw = () => {
        instance.clear();

        if (latestTriggerRef.current > lastHandledTrigger) {
          spawnFlock();
          lastHandledTrigger = latestTriggerRef.current;
        }

        for (let index = birds.length - 1; index >= 0; index -= 1) {
          const bird = birds[index];

          bird.update();
          bird.render();

          if (bird.isOffscreen()) {
            birds.splice(index, 1);
          }
        }
      };

      instance.windowResized = () => {
        resizeToContainer();
      };
    };

    sketchRef.current = new P5(sketch, container);

    return () => {
      sketchRef.current?.remove();
      sketchRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="canvas-surface canvas-surface--overlay" />;
}

export default BirdOverlay;
