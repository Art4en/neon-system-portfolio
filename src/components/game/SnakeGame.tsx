import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { readStorage, writeStorage } from '../../lib/storage';
import { gsap } from '../../lib/gsap';
import { sfx } from '../../audio/synth';
import { Modal } from '../ui/Modal';

const N = 20;
type Dir = 'up' | 'down' | 'left' | 'right';
const VEC: Record<Dir, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
const KEYS: Record<string, Dir> = {
  arrowup: 'up',
  w: 'up',
  z: 'up',
  arrowdown: 'down',
  s: 'down',
  arrowleft: 'left',
  a: 'left',
  q: 'left',
  arrowright: 'right',
  d: 'right',
};

/** Mini-jeu bonus : NEON_SNAKE.exe (lancé par `play` dans le terminal). Meilleur score en local. */
export default function SnakeGame() {
  const setGameOpen = useAppStore((s) => s.setGameOpen);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => readStorage('neon.snake.best', 0));
  const [state, setState] = useState<'ready' | 'playing' | 'paused' | 'over'>('ready');
  const game = useRef({
    snake: [
      [10, 10],
      [9, 10],
      [8, 10],
    ] as [number, number][],
    dir: 'right' as Dir,
    queue: [] as Dir[],
    food: [15, 10] as [number, number],
    acc: 0,
    step: 0.12,
    state: 'ready' as 'ready' | 'playing' | 'paused' | 'over',
    score: 0,
  });

  const setGameState = (s: typeof state) => {
    game.current.state = s;
    setState(s);
  };

  const reset = () => {
    const g = game.current;
    g.snake = [
      [10, 10],
      [9, 10],
      [8, 10],
    ];
    g.dir = 'right';
    g.queue = [];
    g.food = [15, 10];
    g.step = 0.12;
    g.score = 0;
    setScore(0);
    setGameState('playing');
  };

  const turn = (d: Dir) => {
    const g = game.current;
    if (g.state === 'ready' || g.state === 'over') reset();
    const last = g.queue[g.queue.length - 1] ?? g.dir;
    if (d !== last && d !== OPPOSITE[last] && g.queue.length < 3) g.queue.push(d);
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const size = () => {
      const px = Math.min(480, window.innerWidth - 64, window.innerHeight - 300);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(200, px) * dpr;
      canvas.height = Math.max(200, px) * dpr;
      canvas.style.width = canvas.style.height = `${Math.max(200, px)}px`;
    };
    size();
    window.addEventListener('resize', size);

    const placeFood = () => {
      const g = game.current;
      let f: [number, number];
      do f = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)];
      while (g.snake.some(([x, y]) => x === f[0] && y === f[1]));
      g.food = f;
    };

    const update = () => {
      const g = game.current;
      if (g.queue.length) g.dir = g.queue.shift()!;
      const [dx, dy] = VEC[g.dir];
      const head: [number, number] = [g.snake[0][0] + dx, g.snake[0][1] + dy];
      const hitWall = head[0] < 0 || head[1] < 0 || head[0] >= N || head[1] >= N;
      const hitSelf = g.snake.some(([x, y]) => x === head[0] && y === head[1]);
      if (hitWall || hitSelf) {
        setGameState('over');
        sfx.error();
        setBest((b) => {
          const nb = Math.max(b, g.score);
          writeStorage('neon.snake.best', nb);
          return nb;
        });
        return;
      }
      g.snake.unshift(head);
      if (head[0] === g.food[0] && head[1] === g.food[1]) {
        g.score += 10;
        g.step = Math.max(0.055, g.step * 0.96);
        setScore(g.score);
        sfx.unlock();
        placeFood();
      } else g.snake.pop();
    };

    const draw = (t: number) => {
      const g = game.current;
      const W = canvas.width;
      const c = W / N;
      ctx.fillStyle = '#05060a';
      ctx.fillRect(0, 0, W, W);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= N; i++) {
        ctx.beginPath();
        ctx.moveTo(i * c, 0);
        ctx.lineTo(i * c, W);
        ctx.moveTo(0, i * c);
        ctx.lineTo(W, i * c);
        ctx.stroke();
      }
      // nourriture qui pulse
      const pulse = 0.75 + Math.sin(t * 6) * 0.15;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#ff2bd6';
      ctx.fillStyle = '#ff2bd6';
      const fs = c * pulse;
      ctx.fillRect(g.food[0] * c + (c - fs) / 2, g.food[1] * c + (c - fs) / 2, fs, fs);
      // serpent
      ctx.shadowColor = '#00f0ff';
      g.snake.forEach(([x, y], i) => {
        ctx.fillStyle =
          i === 0 ? '#e6fdff' : `rgba(0, 240, 255, ${1 - (i / g.snake.length) * 0.6})`;
        ctx.fillRect(x * c + 2, y * c + 2, c - 4, c - 4);
      });
      ctx.shadowBlur = 0;
    };

    const tick = (time: number, deltaTime: number) => {
      const g = game.current;
      if (g.state === 'playing') {
        g.acc += deltaTime / 1000;
        while (g.acc >= g.step && g.state === 'playing') {
          g.acc -= g.step;
          update();
        }
      }
      draw(time);
    };
    gsap.ticker.add(tick);

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (KEYS[k]) {
        e.preventDefault();
        turn(KEYS[k]);
      } else if (k === ' ' || k === 'p') {
        e.preventDefault();
        const g = game.current;
        if (g.state === 'playing') setGameState('paused');
        else if (g.state === 'paused') setGameState('playing');
        else reset();
      } else if (k === 'enter' && game.current.state !== 'playing') {
        e.preventDefault();
        reset();
      }
    };
    window.addEventListener('keydown', onKey);

    // Swipe sur mobile.
    let sx = 0;
    let sy = 0;
    const ts = (e: TouchEvent) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
    };
    canvas.addEventListener('touchstart', ts, { passive: true });
    canvas.addEventListener('touchend', te, { passive: true });

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', size);
      canvas.removeEventListener('touchstart', ts);
      canvas.removeEventListener('touchend', te);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => setGameOpen(false);

  return (
    <Modal onClose={close} labelledBy="snake-title" className="snake">
      <div className="snake__head">
        <h2 id="snake-title" className="font-display uppercase tracking-[0.2em] text-accent">
          NEON_SNAKE.exe
        </h2>
        <button
          type="button"
          className="hud-btn"
          onClick={close}
          aria-label="Fermer le jeu (Échap)"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="snake__scores micro">
        <span>
          SCORE <b className="text-ink tabular-nums">{String(score).padStart(4, '0')}</b>
        </span>
        <span>
          BEST <b className="text-neon-yellow tabular-nums">{String(best).padStart(4, '0')}</b>
        </span>
      </div>
      <div className="snake__board">
        <canvas ref={canvasRef} aria-label="Plateau de jeu Snake" role="img" />
        {state !== 'playing' && (
          <div className="snake__overlay">
            <p className="h-display text-2xl glow-text">
              {state === 'over' ? 'Game over' : state === 'paused' ? 'Pause' : 'Ready?'}
            </p>
            <p className="micro mt-3">Flèches / ZQSD / swipe · Espace = pause</p>
            <button type="button" className="btn-neon btn-sm mt-5" onClick={reset}>
              {state === 'over' ? 'Rejouer' : state === 'paused' ? 'Reprendre' : 'Jouer'}
            </button>
          </div>
        )}
      </div>
      <div className="snake__pad" aria-label="Contrôles tactiles">
        <button
          type="button"
          aria-label="Haut"
          onClick={() => turn('up')}
          className="snake__pad-up"
        >
          <ArrowUp size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Gauche"
          onClick={() => turn('left')}
          className="snake__pad-left"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Bas"
          onClick={() => turn('down')}
          className="snake__pad-down"
        >
          <ArrowDown size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Droite"
          onClick={() => turn('right')}
          className="snake__pad-right"
        >
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
    </Modal>
  );
}
