import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Grid from "./components/Grid.jsx";

const ROWS = 25;
const COLS = 25;

const createEmptyGrid = () =>
  Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => false));

const createRandomGrid = () =>
  Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => Math.random() > 0.75),
  );

const PRESETS = [
  {
    name: "Glider",
    description: "A small, self-moving pattern that travels diagonally.",
    width: 3,
    height: 3,
    cells: [
      [0, 2],
      [1, 0],
      [1, 2],
      [2, 1],
      [2, 2],
    ],
  },
  {
    name: "Lightweight Spaceship",
    description: "A fast-moving spaceship that travels horizontally.",
    width: 5,
    height: 4,
    cells: [
      [0, 1],
      [0, 4],
      [1, 0],
      [2, 0],
      [3, 0],
      [3, 4],
      [4, 0],
      [4, 1],
      [4, 2],
      [4, 3],
    ],
  },
  {
    name: "Pulsar",
    description: "A classic oscillator with a 3-phase period.",
    width: 13,
    height: 13,
    cells: [
      [2, 4],
      [2, 5],
      [2, 6],
      [2, 10],
      [2, 11],
      [2, 12],
      [4, 2],
      [5, 2],
      [6, 2],
      [4, 7],
      [5, 7],
      [6, 7],
      [4, 9],
      [5, 9],
      [6, 9],
      [4, 14],
      [5, 14],
      [6, 14],
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 10],
      [7, 11],
      [7, 12],
      [9, 4],
      [9, 5],
      [9, 6],
      [9, 10],
      [9, 11],
      [9, 12],
      [10, 2],
      [11, 2],
      [12, 2],
      [10, 7],
      [11, 7],
      [12, 7],
      [10, 9],
      [11, 9],
      [12, 9],
      [10, 14],
      [11, 14],
      [12, 14],
    ],
  },
  {
    name: "R-pentomino",
    description: "A tiny pattern that grows into a chaotic cluster.",
    width: 3,
    height: 3,
    cells: [
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
  },
  {
    name: "Gosper Glider Gun",
    description: "The first known pattern that emits gliders indefinitely.",
    width: 36,
    height: 9,
    cells: [
      [0, 24],
      [1, 22],
      [1, 24],
      [2, 12],
      [2, 13],
      [2, 20],
      [2, 21],
      [2, 34],
      [2, 35],
      [3, 11],
      [3, 15],
      [3, 20],
      [3, 21],
      [3, 34],
      [3, 35],
      [4, 0],
      [4, 1],
      [4, 10],
      [4, 16],
      [4, 20],
      [4, 21],
      [5, 0],
      [5, 1],
      [5, 10],
      [5, 14],
      [5, 16],
      [5, 17],
      [5, 22],
      [5, 24],
      [6, 10],
      [6, 16],
      [6, 24],
      [7, 11],
      [7, 15],
      [8, 12],
      [8, 13],
    ],
  },
];

const neighborOffsets = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

function App() {
  const [grid, setGrid] = useState(() => createEmptyGrid());
  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const toggleCell = useCallback((row, col) => {
    setGrid((prevGrid) => {
      const nextGrid = prevGrid.map((gridRow) => [...gridRow]);
      nextGrid[row][col] = !nextGrid[row][col];
      return nextGrid;
    });
  }, []);

  const clearGrid = useCallback(() => {
    setGrid(createEmptyGrid());
  }, []);

  const randomizeGrid = useCallback(() => {
    setGrid(createRandomGrid());
  }, []);

  const createPatternGrid = useCallback((preset) => {
    const grid = createEmptyGrid();
    const rowOffset = Math.floor((ROWS - preset.height) / 2);
    const colOffset = Math.floor((COLS - preset.width) / 2);

    preset.cells.forEach(([row, col]) => {
      const targetRow = rowOffset + row;
      const targetCol = colOffset + col;
      if (
        targetRow >= 0 &&
        targetRow < ROWS &&
        targetCol >= 0 &&
        targetCol < COLS
      ) {
        grid[targetRow][targetCol] = true;
      }
    });

    return grid;
  }, []);

  const loadPreset = useCallback(
    (preset) => {
      setRunning(false);
      runningRef.current = false;
      setGrid(createPatternGrid(preset));
    },
    [createPatternGrid],
  );

  const nextGeneration = useCallback(() => {
    setGrid((prevGrid) =>
      prevGrid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const neighbors = neighborOffsets.reduce((count, [dx, dy]) => {
            const newRow = rowIndex + dx;
            const newCol = colIndex + dy;
            if (
              newRow >= 0 &&
              newRow < ROWS &&
              newCol >= 0 &&
              newCol < COLS &&
              prevGrid[newRow][newCol]
            ) {
              return count + 1;
            }
            return count;
          }, 0);

          if (cell) {
            return neighbors === 2 || neighbors === 3;
          }

          return neighbors === 3;
        }),
      ),
    );
  }, []);

  const simulationTimeoutRef = useRef(null);
  const runSimulationRef = useRef(null);

  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;
    nextGeneration();
    simulationTimeoutRef.current = setTimeout(() => {
      runSimulationRef.current?.();
    }, 150);
  }, [nextGeneration]);

  useEffect(() => {
    runSimulationRef.current = runSimulation;
  }, [runSimulation]);

  const handleRun = useCallback(() => {
    setRunning(true);
    runningRef.current = true;
    runSimulation();
  }, [runSimulation]);

  const handleStop = useCallback(() => {
    setRunning(false);
    runningRef.current = false;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "s" && !running) {
        handleRun();
      } else if (key === "x" && running) {
        handleStop();
      } else if (key === "e" && !running) {
        nextGeneration();
      } else if (key === "r" && !running) {
        randomizeGrid();
      } else if (key === "c" && !running) {
        clearGrid();
      } else if (key >= "1" && key <= String(PRESETS.length) && !running) {
        loadPreset(PRESETS[Number(key) - 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    running,
    handleRun,
    handleStop,
    nextGeneration,
    randomizeGrid,
    clearGrid,
    loadPreset,
  ]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 style={{ color: "black" }}>Conway&apos;s Game of Life</h1>
        <p>
          Click cells to toggle alive/dead and prepare your starting pattern.
        </p>
      </header>

      <section className="controls">
        {[
          {
            name: "Start",
            onClick: handleRun,
            disabled: running,
            shortcut: "S",
          },
          {
            name: "Stop",
            onClick: handleStop,
            disabled: !running,
            shortcut: "X",
          },
          {
            name: "Step",
            onClick: nextGeneration,
            disabled: running,
            shortcut: "E",
          },
          {
            name: "Random",
            onClick: randomizeGrid,
            disabled: running,
            shortcut: "R",
          },
          {
            name: "Clear",
            onClick: clearGrid,
            disabled: running,
            shortcut: "C",
          },
        ].map(({ name, onClick, disabled, shortcut }) => (
          <button
            key={name}
            type="button"
            onClick={onClick}
            disabled={disabled}
          >
            <span>{name}</span>
            <span className="shortcut-badge">{shortcut}</span>
          </button>
        ))}
      </section>
      <p className="shortcut-note">
        Keyboard shortcuts: S = Start, X = Stop, E = Step, R = Random, C =
        Clear. Patterns: 1–5.
      </p>

      <div className="board-wrapper">
        <Grid grid={grid} toggleCell={toggleCell} />
      </div>

      <section className="preset-panel">
        <h2>Famous starting patterns</h2>
        <p className="preset-note">
          Load one of these classic Conway patterns to test how it evolves.
        </p>
        <div className="preset-grid">
          {PRESETS.map((preset, index) => (
            <button
              key={preset.name}
              type="button"
              className="preset-button"
              onClick={() => loadPreset(preset)}
              disabled={running}
            >
              <div className="preset-heading">
                <strong>{preset.name}</strong>
                <span className="preset-shortcut">{index + 1}</span>
              </div>
              <span className="preset-description">{preset.description}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
