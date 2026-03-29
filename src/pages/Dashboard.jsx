import { useState, useEffect } from 'react'
import WeightChart from '../components/WeightChart'
import { getWeightEntries, addWeightEntry, deleteWeightEntry } from '../services/storage'
import { getCompletedSessions } from '../services/storage'

export default function Dashboard() {
  const [entries, setEntries] = useState([])
  const [sessions, setSessions] = useState([])
  const [weight, setWeight] = useState('')
  
  // Custom precise date formatter locally to avoid UTC offset issues in JS
  function getLocalDateString() {
    const today = new Date();
    return today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  }
  const [date, setDate] = useState(getLocalDateString())
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    setEntries(getWeightEntries())
    setSessions(getCompletedSessions())
  }, [])

  function handleAddWeight(e) {
    if (e) e.preventDefault()
    if (!weight || !date) return
    addWeightEntry(date, weight)
    setEntries(getWeightEntries())
    setWeight('')
    setDate(getLocalDateString())
  }

  function handleDelete(id) {
    deleteWeightEntry(id)
    setEntries(getWeightEntries())
  }

  // Safe formatting for legacy dates preventing crashes
  function formatDate(dateStr) {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return String(dateStr)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Safe History Calculation
  const lastWeight = entries.length > 0 ? entries[entries.length - 1].weight : null
  const firstWeight = entries.length > 1 ? entries[0].weight : (lastWeight || null)
  const diffFloat = lastWeight !== null && firstWeight !== null ? (lastWeight - firstWeight) : 0
  const hasEvolution = entries.length > 1 // True even if exactly 0.0kg difference

  return (
    <div className="px-4 py-8 space-y-6 pb-24">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Résumé</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="ios-card p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="text-[13px] font-medium text-blue-400 mb-1">Poids Actuel</div>
          <div className="text-2xl font-bold text-white relative z-10">
            {lastWeight ? `${lastWeight} kg` : '—'}
          </div>
        </div>
        <div className="ios-card p-4 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${hasEvolution && diffFloat < 0 ? 'from-green-500/20' : hasEvolution && diffFloat > 0 ? 'from-red-500/20' : hasEvolution ? 'from-indigo-500/20' : 'from-gray-500/20'} to-transparent rounded-bl-full pointer-events-none`}></div>
          <div className={`text-[13px] font-medium mb-1 ${hasEvolution && diffFloat < 0 ? 'text-green-400' : hasEvolution && diffFloat > 0 ? 'text-red-400' : hasEvolution ? 'text-indigo-400' : 'text-text-muted'}`}>Évolution</div>
          <div className="text-2xl font-bold text-white relative z-10">
            {hasEvolution ? `${diffFloat > 0 ? '+' : ''}${diffFloat.toFixed(1)} kg` : '—'}
          </div>
        </div>
      </div>

      {/* Weight Component */}
      <div className="ios-card overflow-hidden shadow-lg shadow-black border border-white/5">
        <div className="p-4 border-b border-white/[0.15] bg-gradient-to-r from-blue-900/10 to-transparent">
          <form onSubmit={handleAddWeight} className="flex gap-2 relative z-10">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-[120px] px-3 py-2 rounded-lg bg-black/40 text-white text-[15px] focus:outline-none border border-white/10"
              required
            />
            <input
              type="number" step="0.1" min="20" max="300"
              placeholder="Poids (kg)"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-black/40 text-white text-[15px] focus:outline-none placeholder:text-text-muted border border-white/10 font-medium"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg text-[15px] active:scale-95 transition-all shadow-lg shadow-blue-500/20"
            >
              Ajouter
            </button>
          </form>
        </div>

        <div className="p-4 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-semibold text-white tracking-tight">Suivi de poids</h2>
            {entries.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="text-[13px] font-bold tracking-wide text-blue-400 px-3 py-1.5 rounded-md bg-blue-500/10 active:opacity-70 transition-colors"
              >
                {showHistory ? 'Graphique' : 'Historique'}
              </button>
            )}
          </div>
          
          {showHistory ? (
            <div className="max-h-[220px] overflow-y-auto pr-1">
              {entries.length === 0 && <p className="text-center text-text-muted">Aucune donnée</p>}
              <div className="flex flex-col">
                {[...entries].reverse().map(entry => (
                  <div key={entry.id} className="ios-list-item py-3 flex items-center justify-between group">
                    <div className="flex flex-col">
                      <span className="text-[17px] font-bold text-white">{entry.weight} <span className="text-[13px] font-normal text-text-muted">kg</span></span>
                      <span className="text-[13px] text-text-muted font-medium mt-0.5">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-500 font-bold text-[14px] px-3 py-1.5 rounded-lg bg-red-500/10 active:opacity-50 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px]">
              <WeightChart entries={entries} />
            </div>
          )}
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[15px] font-bold text-text-muted uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            Séances Récentes
          </h2>
          <div className="ios-card flex flex-col px-2 border border-white/5 shadow-lg shadow-black">
            {sessions.slice(-5).reverse().map((session, i) => (
              <div key={session.id} className="ios-list-item py-4 px-3 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-emerald-500/30">
                  💪
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[17px] font-bold text-white truncate mb-0.5">{session.workoutName}</h4>
                  <p className="text-[13px] font-medium tracking-wide text-emerald-400/90">
                    {session.exerciseCount} exos terminés
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                   <span className="text-[12px] font-semibold text-text-muted bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                    {formatDate(session.completedAt).replace(/20\d\d/, '')}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
