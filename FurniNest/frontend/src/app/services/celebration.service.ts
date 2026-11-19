import { Injectable } from '@angular/core';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle' | 'star';
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
  decay: number;
}

@Injectable({
  providedIn: 'root'
})
export class CelebrationService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: ConfettiParticle[] = [];
  private animationFrameId: number | null = null;

  private colors = [
    '#f59e0b', // Amber Gold
    '#fbbf24', // Warm Sunlight
    '#10b981', // Emerald Green
    '#34d399', // Mint
    '#ec4899', // Festive Rose
    '#8b5cf6', // Royal Purple
    '#3b82f6', // Sapphire Blue
    '#ef4444', // Ruby
    '#f8fafc'  // Diamond White
  ];

  private ensureCanvas() {
    if (!this.canvas && typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'furninest-celebration-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '9999999';
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
    }

    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  /**
   * Launch a grand festive celebration confetti blast
   */
  celebrate(particleCount = 130) {
    this.ensureCanvas();
    if (!this.ctx || !this.canvas) return;

    // Center-origin burst + side cannons
    const originX = this.canvas.width / 2;
    const originY = this.canvas.height * 0.45;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 16 + 6;
      const shapeType: 'rect' | 'circle' | 'star' = 
        i % 4 === 0 ? 'star' : (i % 2 === 0 ? 'rect' : 'circle');

      this.particles.push({
        x: originX + (Math.random() - 0.5) * 60,
        y: originY + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6, // upward bias
        size: Math.random() * 8 + 6,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        shape: shapeType,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
        opacity: 1,
        decay: Math.random() * 0.006 + 0.007
      });
    }

    // Add dual side cannon bursts
    this.addSideCannon(this.canvas.width * 0.1, this.canvas.height * 0.7, 45, 35);
    this.addSideCannon(this.canvas.width * 0.9, this.canvas.height * 0.7, 135, 35);

    if (!this.animationFrameId) {
      this.loop();
    }
  }

  private addSideCannon(startX: number, startY: number, angleDeg: number, count: number) {
    const rad = (angleDeg * Math.PI) / 180;
    for (let i = 0; i < count; i++) {
      const angle = rad + (Math.random() - 0.5) * 0.6;
      const speed = Math.random() * 18 + 8;
      this.particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle) * speed) - 4,
        size: Math.random() * 7 + 5,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        shape: i % 3 === 0 ? 'star' : 'rect',
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
        opacity: 1,
        decay: Math.random() * 0.006 + 0.006
      });
    }
  }

  private loop = () => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Physics
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38; // gravity
      p.vx *= 0.985; // air drag
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);

      this.ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        const width = p.size * Math.cos(p.wobble);
        this.ctx.fillRect(-width / 2, -p.size / 2, width, p.size);
      } else if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'star') {
        this.drawStar(this.ctx, 0, 0, 5, p.size, p.size / 2);
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    } else {
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      this.animationFrameId = null;
    }
  };

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}

