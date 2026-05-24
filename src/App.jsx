import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import Grid from './components/Grid.jsx'

const ROWS = 100
const COLS = 100

const createEmptyGrid = () =>
  Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => false))

const createRandomGrid = () =>
  Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => Math.random() > 0.75),
  )

const neighborOffsets = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

function App() {
  const [grid, setGrid] = useState(() => createEmptyGrid())
  const [running, setRunning] = useState(false)
  const runningRef = useRef(running)

  useEffect(() => {
    runningRef.current = running
  }, [running])

  const toggleCell = useCallback((row, col) => {
    setGrid((prevGrid) => {
      const nextGrid = prevGrid.map((gridRow) => [...gridRow])
      nextGrid[row][col] = !nextGrid[row][col]
      return nextGrid
    })
  }, [])

  const clearGrid = () => {
    setGrid(createEmptyGrid())
  }

  const randomizeGrid = () => {
    setGrid(createRandomGrid())
  }

  const nextGeneration = useCallback(() => {
    setGrid((prevGrid) =>
      prevGrid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const neighbors = neighborOffsets.reduce((count, [dx, dy]) => {
            const newRow = rowIndex + dx
            const newCol = colIndex + dy
            if (
              newRow >= 0 &&
              newRow < ROWS &&
              newCol >= 0 &&
              newCol < COLS &&
              prevGrid[newRow][newCol]
            ) {
              return count + 1
            }
            return count
          }, 0)

          if (cell) {
            return neighbors === 2 || neighbors === 3
          }

          return neighbors === 3
        }),
      ),
    )
  }, [])

  const runSimulation = useCallback(() => {
    if (!runningRef.current) return
    nextGeneration()
    setTimeout(runSimulation, 150)
  }, [nextGeneration])

  const handleRun = () => {
    setRunning(true)
    runningRef.current = true
    runSimulation()
  }

  const handleStop = () => {
    setRunning(false)
    runningRef.current = false
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Conway&apos;s Game of Life</h1>
        <p>Click cells to toggle alive/dead and prepare your starting pattern.</p>
      </header>

      <section className="controls">
        <button type="button" onClick={handleRun} disabled={running}>
          Start
        </button>
        <button type="button" onClick={handleStop} disabled={!running}>
          Stop
        </button>
        <button type="button" onClick={nextGeneration} disabled={running}>
          Step
        </button>
        <button type="button" onClick={randomizeGrid} disabled={running}>
          Random
        </button>
        <button type="button" onClick={clearGrid} disabled={running}>
          Clear
        </button>
      </section>

      <div className="board-wrapper">
        <Grid grid={grid} toggleCell={toggleCell} />
      </div>
    </div>
  )
}

export default App
