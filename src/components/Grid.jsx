import React from 'react'
import Cell from './Cell.jsx'

function Grid({ grid, toggleCell }) {
  return (
    <div className="board" role="grid" aria-label="Conway's Game of Life grid">
      {grid.map((row, rowIndex) =>
        row.map((alive, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            row={rowIndex}
            col={colIndex}
            alive={alive}
            toggleCell={toggleCell}
          />
        )),
      )}
    </div>
  )
}

export default React.memo(Grid)
