// Constants
const LINE_WIDTH = 2;
const FOOD_COLOR = 'red';
const SNAKE_COLOR = 'green';
const SNAKE_BORDER_COLOR = 'black';
const CELL_SIZE = 50;
const DEFAULT_SNAKE_SIZE = 3;
const GAME_TICK_INTERVAL = 170;
const DEFAULT_SNAKE = [{ x: 0, y: 0 }];
const DEFAULT_DIRECTION = { x: CELL_SIZE, y: 0 };

const PRESSED_ARROW_KEY_MAPPING = {
  ArrowUp: {
    direction: { x: 0, y: -CELL_SIZE },
    opposite: 'ArrowDown',
  },
  ArrowDown: {
    direction: { x: 0, y: CELL_SIZE },
    opposite: 'ArrowUp',
  },
  ArrowLeft: {
    direction: { x: -CELL_SIZE, y: 0 },
    opposite: 'ArrowRight',
  },
  ArrowRight: {
    direction: { x: CELL_SIZE, y: 0 },
    opposite: 'ArrowLeft',
  },
};

// DOM Elements
const victoryElement = document.querySelector('.victory');
const gameOverElement = document.querySelector('.game-over');
const scoreElement = document.querySelector('.score');
const bestScoreElement = document.querySelector('.best-score');
const reloadButton = document.querySelector('.reload');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
ctx.lineWidth = LINE_WIDTH;

// State
let snake, direction, pressedArrowKeysQueue, currentPressedArrowKey, score, bestScore, food, gameInterval;

// Functions
const clearBoard = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
const hasEatenFood = (head) => (head.x === food.x && head.y === food.y);
const generateRandomPosition = (maxLegth) => Math.floor(Math.random() * maxLegth / CELL_SIZE) * CELL_SIZE;
const isIntersect = (snake, object) => snake.some((part) => part.x === object.x && part.y === object.y);

const drawFood = () => {
  ctx.fillStyle = FOOD_COLOR;
  ctx.fillRect(food.x, food.y, CELL_SIZE, CELL_SIZE);
};

const drawSnake = () => {
  ctx.fillStyle = SNAKE_COLOR;
  ctx.strokeStyle = SNAKE_BORDER_COLOR;

  snake.forEach((snakePart) =>  {
    ctx.fillRect(snakePart.x, snakePart.y, CELL_SIZE, CELL_SIZE);
    ctx.strokeRect(snakePart.x, snakePart.y, CELL_SIZE, CELL_SIZE);
  });
};

const checkCollision = () => {
  const [head, ...body] = snake;

  if (isIntersect(body, head)) {
    clearInterval(gameInterval);
    gameOverElement.classList.remove('hidden');
  }
};

const checkVictory = () => {
  if (snake.length === ((canvas.width * canvas.height) / (CELL_SIZE ** 2) - 1)) {
    clearInterval(gameInterval);
    victoryElement.classList.remove('hidden');
  }
};

const createFood = () => {
  let foodX, foodY;

  do {
    foodX = generateRandomPosition(canvas.width);
    foodY = generateRandomPosition(canvas.height);
  } while (isIntersect(snake, { x: foodX, y: foodY }));

  return { x: foodX, y: foodY };
};

const updateScore = () => {
  score++;
  scoreElement.textContent = score;

  if (score > bestScore) {
    bestScore = score;
    bestScoreElement.textContent = bestScore;
    localStorage.setItem('bestScore', bestScore);
  }
};

const moveSnake = () => {
  if (pressedArrowKeysQueue.length) {
    const currentKey = pressedArrowKeysQueue.shift();
    direction = PRESSED_ARROW_KEY_MAPPING[currentKey].direction;
  }

  // The modulo operation (%) ensures the snake reappears on the opposite edge of the canvas
  const newHead = {
    x: (snake[0].x + direction.x + canvas.width) % canvas.width,
    y: (snake[0].y + direction.y + canvas.height) % canvas.height,
  };

  snake.unshift(newHead);

  if (hasEatenFood(newHead)) {
    food = createFood();
    updateScore();
  }
  else snake.pop();
};

const startGame = () => {
  clearInterval(gameInterval);

  snake = [...DEFAULT_SNAKE];
  direction = DEFAULT_DIRECTION;
  pressedArrowKeysQueue = [];
  currentPressedArrowKey = 'ArrowRight'
  score = 0;
  bestScore = localStorage.getItem('bestScore') || 0;
  food = createFood();

  scoreElement.textContent = score;
  bestScoreElement.textContent = bestScore;
  gameOverElement.classList.add('hidden');
  victoryElement.classList.add('hidden');

  gameInterval = setInterval(() => {
    clearBoard();
    moveSnake();
    drawSnake();
    drawFood();
    checkCollision();
    checkVictory();
  }, GAME_TICK_INTERVAL);
};

// Event Listeners
window.addEventListener('keydown', ({ key }) => {
  if (!PRESSED_ARROW_KEY_MAPPING[key]) return;
  if (currentPressedArrowKey === PRESSED_ARROW_KEY_MAPPING[key].opposite) return;

  currentPressedArrowKey = key;
  pressedArrowKeysQueue.push(key);
});

reloadButton.addEventListener('click', startGame);

// Start Game
startGame();
