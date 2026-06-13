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

const COLOR_SCHEMES = [
  { id: "main", title: "Classic" },
  { id: "light1", title: "Sky" },
  { id: "light2", title: "Sand" },
  { id: "dark1", title: "Indigo" },
  { id: "dark2", title: "Forest" },
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
  const [savedPatterns, setSavedPatterns] = useState([]);
  const [theme, setTheme] = useState("main");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [pendingPatternName, setPendingPatternName] = useState("");
  const saveInputRef = useRef(null);
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

  const isBoardEmpty = grid.every((row) => row.every((cell) => !cell));

  const closeSaveModal = useCallback(() => {
    setSaveModalOpen(false);
  }, []);

  const savePattern = useCallback(() => {
    if (isBoardEmpty || savedPatterns.length >= 5 || running) {
      return;
    }

    const currentGridAsString = JSON.stringify(grid);
    const isCurrentGridAPreset = PRESETS.some((preset) => {
      const presetGrid = createEmptyGrid();
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
          presetGrid[targetRow][targetCol] = true;
        }
      });

      return JSON.stringify(presetGrid) === currentGridAsString;
    });

    if (isCurrentGridAPreset) {
      return;
    }

    const defaultName = `Saved pattern ${savedPatterns.length + 1}`;
    setPendingPatternName(defaultName);
    setSaveModalOpen(true);
  }, [isBoardEmpty, savedPatterns.length, running, grid]);

  const confirmSavePattern = useCallback(() => {
    if (
      !pendingPatternName.trim() ||
      isBoardEmpty ||
      savedPatterns.length >= 5
    ) {
      return;
    }

    setSavedPatterns((prevPatterns) => [
      ...prevPatterns,
      {
        id: Date.now(),
        name: pendingPatternName.trim(),
        grid: grid.map((row) => [...row]),
      },
    ]);
    setSaveModalOpen(false);
  }, [grid, isBoardEmpty, pendingPatternName, savedPatterns.length]);

  const loadSavedPattern = useCallback((pattern) => {
    setRunning(false);
    runningRef.current = false;
    setGrid(pattern.grid.map((row) => [...row]));
  }, []);

  const deleteSavedPattern = useCallback((patternIndex) => {
    setSavedPatterns((prevPatterns) =>
      prevPatterns.filter((_, index) => index !== patternIndex),
    );
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
      } else if (key === "v" && !running) {
        event.preventDefault();
        savePattern();
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
    savePattern,
  ]);

  useEffect(() => {
    if (saveModalOpen && saveInputRef.current) {
      saveInputRef.current.focus();
      saveInputRef.current.select();
    }
  }, [saveModalOpen]);

  return (
    <div className={`app-shell theme-${theme}`}>
      <header className="app-header">
        <svg
          className="page-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          role="img"
          aria-label="Game of Life icon"
        >
          <rect width="64" height="64" rx="12" fill="var(--surface-strong)" />
          <g fill="var(--text)">
            <rect x="6" y="6" width="12" height="12" rx="3" />
            <rect x="26" y="6" width="12" height="12" rx="3" />
            <rect x="46" y="6" width="12" height="12" rx="3" />
            <rect x="6" y="26" width="12" height="12" rx="3" />
            <rect x="26" y="26" width="12" height="12" rx="3" />
            <rect x="46" y="26" width="12" height="12" rx="3" />
            <rect x="6" y="46" width="12" height="12" rx="3" />
            <rect x="26" y="46" width="12" height="12" rx="3" />
          </g>
          <rect
            x="26"
            y="46"
            width="12"
            height="12"
            rx="3"
            fill="var(--accent)"
          />
          <rect
            x="6"
            y="26"
            width="12"
            height="12"
            rx="3"
            fill="var(--accent)"
          />
          <rect
            x="46"
            y="6"
            width="12"
            height="12"
            rx="3"
            fill="var(--accent)"
          />
        </svg>
        <h1>Conway&apos;s Game of Life</h1>
        <p>
          Click cells to toggle alive/dead and prepare your starting pattern.
        </p>
      </header>

      <section className="theme-selector">
        <h2>Color schemes</h2>
        <div className="theme-buttons">
          {COLOR_SCHEMES.map((scheme) => (
            <button
              key={scheme.id}
              type="button"
              className={`theme-button ${scheme.id} ${theme === scheme.id ? "active" : ""}`}
              aria-label={scheme.title}
              title={scheme.title}
              onClick={() => setTheme(scheme.id)}
            >
              <span className="sr-only">{scheme.title}</span>
            </button>
          ))}
        </div>
      </section>

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
        Clear. Patterns: 1–5, V = Save current pattern.
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

      <section className="saved-panel">
        <div className="saved-header">
          <div>
            <h2>Saved patterns</h2>
            <p className="preset-note">
              Save up to 5 custom patterns and load them when you need them.
            </p>
          </div>
          <button
            type="button"
            className="save-pattern-button"
            onClick={savePattern}
            disabled={running || isBoardEmpty || savedPatterns.length >= 5}
          >
            Save current pattern
            <span className="shortcut-badge">V</span>
          </button>
        </div>

        <div className="preset-grid">
          {savedPatterns.length > 0 ? (
            savedPatterns.map((pattern, index) => (
              <div key={pattern.id} className="saved-pattern-card">
                <button
                  type="button"
                  className="preset-button saved-pattern-button"
                  onClick={() => loadSavedPattern(pattern)}
                  disabled={running}
                >
                  <div className="preset-heading">
                    <strong>{pattern.name}</strong>
                    <span className="preset-shortcut">{index + 1}</span>
                  </div>
                  <span className="preset-description">
                    Custom saved pattern
                  </span>
                </button>
                <button
                  type="button"
                  className="saved-delete-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteSavedPattern(index);
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <div className="saved-empty">No saved patterns yet.</div>
          )}
        </div>
      </section>

      {saveModalOpen ? (
        <div className="modal-overlay" onClick={closeSaveModal}>
          <div
            className="save-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="save-modal-title">Name your pattern</h3>
            <p>Enter a custom name for your saved pattern.</p>
            <input
              ref={saveInputRef}
              type="text"
              value={pendingPatternName}
              onChange={(event) => setPendingPatternName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  confirmSavePattern();
                } else if (event.key === "Escape") {
                  closeSaveModal();
                }
              }}
              placeholder="Pattern name"
            />
            <div className="save-modal-actions">
              <button
                type="button"
                className="save-pattern-button"
                onClick={confirmSavePattern}
                disabled={!pendingPatternName.trim()}
              >
                Save
              </button>
              <button
                type="button"
                className="saved-delete-button"
                onClick={closeSaveModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
