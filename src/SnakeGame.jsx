import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SIZE = 20;
const WIDTH = 300;
const HEIGHT = 300;

const ITEMS = ["🛞", "🎁", "🛢️", "💰", "⛽", "🔧"];

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const [snake, setSnake] = useState([{ x: 5, y: 5 }]);
  const [food, setFood] = useState(randomFood());
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [nextDir, setNextDir] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(3);

  function randomFood() {
    return {
      x: Math.floor(Math.random() * (WIDTH / SIZE)),
      y: Math.floor(Math.random() * (HEIGHT / SIZE)),
      icon: ITEMS[Math.floor(Math.random() * ITEMS.length)]
    };
  }

  const changeDir = (newDir) => {
    if (
      (newDir.x === -dir.x && newDir.x !== 0) ||
      (newDir.y === -dir.y && newDir.y !== 0)
    ) return;

    setNextDir(newDir);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowUp") changeDir({ x: 0, y: -1 });
      if (e.key === "ArrowDown") changeDir({ x: 0, y: 1 });
      if (e.key === "ArrowLeft") changeDir({ x: -1, y: 0 });
      if (e.key === "ArrowRight") changeDir({ x: 1, y: 0 });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dir]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameOver) return;

      setDir(nextDir);

      setSnake(prev => {
        const head = { ...prev[0] };
        head.x += nextDir.x;
        head.y += nextDir.y;

        if (
          head.x < 0 ||
          head.y < 0 ||
          head.x >= WIDTH / SIZE ||
          head.y >= HEIGHT / SIZE ||
          prev.some(p => p.x === head.x && p.y === head.y)
        ) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];

        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          setFood(randomFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });

    }, 220 - speed * 30);

    return () => clearInterval(interval);
  }, [nextDir, food, gameOver, speed]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.font = "18px serif";

    snake.forEach((p) => {
      ctx.fillText("🚘", p.x * SIZE + 2, p.y * SIZE + 17);
    });

    ctx.fillText(food.icon, food.x * SIZE + 2, food.y * SIZE + 17);
  }, [snake, food]);

  const restart = () => {
    setSnake([{ x: 5, y: 5 }]);
    setDir({ x: 1, y: 0 });
    setNextDir({ x: 1, y: 0 });
    setFood(randomFood());
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="p-4 text-center select-none">
      <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 mb-3">
        <ArrowLeft className="mr-1" /> Назад
      </button>

      <h2 className="text-xl font-semibold mb-1">🚘 Автозмейка</h2>
      <p className="mb-2">Счёт: {score}</p>

      <div className="mb-3">
        <p className="text-sm">Сложность: {speed}</p>
        <input
          type="range"
          min="1"
          max="5"
          value={speed}
          onChange={(e) => setSpeed(+e.target.value)}
          className="w-64"
        />
      </div>

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="border rounded bg-white"
        />
      </div>

      {/* Контроллер */}
      <div
        className="mx-auto mt-4 grid gap-2"
        style={{ width: WIDTH }}
      >
        
        
        
             <div className="grid grid-cols-3 gap-2">

          <button
            className="h-33 text-4xl bg-gray-200 rounded-xl shadow active:scale-95"
            onTouchStart={() => changeDir({ x: -1, y: 0 })}
            onMouseDown={() => changeDir({ x: -1, y: 0 })}
          >←</button>

          <div className="flex flex-col gap-2">
            <button
              className="h-16 text-4xl bg-gray-200 rounded-xl shadow active:scale-95"
              onTouchStart={() => changeDir({ x: 0, y: -1 })}
            onMouseDown={() => changeDir({ x: 0, y: -1 })}
            >↑</button>

            <button
              className="h-16 text-4xl bg-gray-200 rounded-xl shadow active:scale-95"
              onTouchStart={() => changeDir({ x: 0, y: 1 })}
            onMouseDown={() => changeDir({ x: 0, y: 1 })}
            >↓</button>
          </div>

          <button
            className="h-33 text-4xl bg-gray-200 rounded-xl shadow active:scale-95"
            onTouchStart={() => changeDir({ x: 1, y: 0 })}
            onMouseDown={() => changeDir({ x: 1, y: 0 })}
          >→</button>

        </div>
        
        
        
        
        
        
      
      </div>

      {gameOver && (
        <div className="mt-6">
          <p className="text-red-600 font-semibold mb-2">🚨 Авария! Игра окончена</p>
          <button
            onClick={restart}
            className="bg-[#86c53f] text-white px-6 py-3 rounded-lg text-lg"
          >
            Начать заново
          </button>
        </div>
      )}

      <p className="text-gray-500 mt-4 text-sm">
        Собирай бонусы и прокачай автомобиль до лимузина 😄
      </p>
    </div>
  );
}
