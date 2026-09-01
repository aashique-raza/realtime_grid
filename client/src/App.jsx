import './App.css'
import { useEffect, useState } from 'react'
import { socket } from './socket.js'

const SIZE = 12
const COLORS = ['#ff5c5c', '#ffb020', '#3ddc84', '#42a5f5', '#b388ff', '#26c6da']

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v9h14v-9" />
      <path d="M12 8v13" />
      <path d="M12 8s0-5-3.5-5S6.5 6 6.5 6 9 8 12 8Z" />
      <path d="M12 8s0-5 3.5-5S17.5 6 17.5 6 15 8 12 8Z" />
    </svg>
  )
}
//  main app component
function App() {
  const [grid, setGrid] = useState({})
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])

  useEffect(() => {
    socket.on('initialGridState', (state) => {
      setGrid(state)
    })

    socket.on('blockUpdated', ({ blockId, name, color }) => {
      setGrid((prev) => ({ ...prev, [blockId]: { name, color } }))
    })

    // ask the server for the current grid once listeners are attached
    socket.emit('getGrid')

    return () => {
      socket.off('initialGridState')
      socket.off('blockUpdated')
    }
  }, [])

  const claimed = Object.keys(grid).length
  const total = SIZE * SIZE

  const handleConfirm = () => {
    if (!name.trim()) return
    socket.emit('claimGrid', { blockId: selected, name: name.trim(), color })
    setSelected(null)
    setName('')
  }

  const closeModal = () => {
    setSelected(null)
    setName('')
  }

  return (
    <div className="app">
      <header className="hud">
        <h1 className="logo">THE_VAULT</h1>
        <div className="track">
          <div className="fill" style={{ width: `${(claimed / total) * 100}%` }} />
        </div>
        <p className="count">{claimed} / {total} claimed</p>
      </header>

      <div className="board-wrap">
        <div className="board">
          {Array.from({ length: SIZE }).map((_, row) =>
            Array.from({ length: SIZE }).map((_, col) => {
              const id = `${row}-${col}`
              const cell = grid[id]
              return (
                <button
                  key={id}
                  className={cell ? 'tile claimed' : 'tile'}
                  style={cell ? { '--tile-color': cell.color } : undefined}
                  title={cell ? `Claimed by ${cell.name}` : `Tile ${id}`}
                  onClick={() => setSelected(id)}
                >
                  {cell ? (
                    <span className="who">{cell.name}</span>
                  ) : (
                    <>
                      <GiftIcon />
                      <span className="label">CLAIM</span>
                    </>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {selected && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Claim this tile</h2>
            <p className="modal-sub">Tile {selected}</p>

            <label className="field-label">Your name</label>
            <input
              className="input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
            />

            <label className="field-label">Pick a color</label>
            <div className="swatches">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={c === color ? 'swatch active' : 'swatch'}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>

            <div className="actions">
              <button className="btn ghost" onClick={closeModal}>Cancel</button>
              <button className="btn primary" onClick={handleConfirm} disabled={!name.trim()}>
                Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
