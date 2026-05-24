import React from 'react'

function Cell({ row, col, alive, toggleCell }) {
  return (
    <button
      type="button"
      className={`cell ${alive ? 'alive' : ''}`}
      onClick={() => toggleCell(row, col)}
      aria-label={`Toggle cell ${row + 1}, ${col + 1}`}
      title={`Row ${row + 1}, Column ${col + 1}`}
    />
  )
}

export default React.memo(Cell)
