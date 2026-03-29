import { useState, useEffect, useCallback } from 'react'
import { fetchBodyParts, fetchExercisesByBodyPart, searchExercises } from '../services/exerciseApi'

export default function ExercisePicker({ onAdd, onClose }) {
  const [bodyParts, setBodyParts] = useState([])
  const [selectedPart, setSelectedPart] = useState('all')
  const [exercises, setExercises] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(12)
  const [restTime, setRestTime] = useState(60)

  // Color mapping for targets
  const getTargetColor = (target) => {
    const hash = target.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'text-blue-400 bg-blue-500/10 border-blue-500/20',
      'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      'text-purple-400 bg-purple-500/10 border-purple-500/20',
      'text-rose-400 bg-rose-500/10 border-rose-500/20',
      'text-amber-400 bg-amber-500/10 border-amber-500/20',
      'text-teal-400 bg-teal-500/10 border-teal-500/20',
    ];
    return colors[hash % colors.length];
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const parts = await fetchBodyParts()
        if (!cancelled) setBodyParts(['all', ...(Array.isArray(parts) ? parts : [])])
      } catch {
        if (!cancelled) setBodyParts(['all'])
      }
      try {
        const data = await fetchExercisesByBodyPart(null, 50)
        if (!cancelled) setExercises(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setExercises([])
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  const loadExercises = useCallback(async (part) => {
    setLoading(true)
    try {
      const data = await fetchExercisesByBodyPart(part === 'all' ? null : part, 50)
      setExercises(Array.isArray(data) ? data : [])
    } catch {
      setExercises([])
    }
    setLoading(false)
  }, [])

  async function handleSearch(q) {
    setSearch(q)
    if (q.length < 2) {
      loadExercises(selectedPart)
      return
    }
    setLoading(true)
    try {
      const data = await searchExercises(q)
      setExercises(Array.isArray(data) ? data : [])
    } catch {
      setExercises([])
    }
    setLoading(false)
  }

  function handleSelectBodyPart(part) {
    setSelectedPart(part)
    setSearch('')
    loadExercises(part)
  }

  function handleAdd(exercise) {
    onAdd({
      exerciseId: exercise.id,
      name: exercise.name,
      bodyPart: exercise.bodyPart,
      target: exercise.target,
      equipment: exercise.equipment,
      gifUrl: exercise.gifUrl,
      sets,
      reps,
      restTime,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md sm:p-4 animate-fade-in">
      <div className="w-full sm:max-w-md h-[92vh] sm:h-[85vh] bg-app-bg sm:rounded-3xl flex flex-col overflow-hidden animate-slide-up sm:border sm:border-white/10 relative pb-safe shadow-2xl shadow-black">
        
        {/* Header - iOS Sheet Style */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-app-card shrink-0 px-5 shadow-sm">
           <button onClick={onClose} className="text-blue-400 font-medium text-[17px] active:opacity-70 px-2 -ml-2 rounded-lg hover:bg-blue-500/10 transition-colors">
             Annuler
           </button>
           <h2 className="text-[17px] font-semibold text-white tracking-tight">Vrai Exercices API</h2>
           <div className="w-16"></div> {/* Spacer for centering */}
        </div>

        {/* Configuration Segmented Area */}
        <div className="px-4 py-4 shrink-0 bg-app-bg border-b border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <input
            type="text"
            placeholder="Rechercher par nom ou muscle..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-white placeholder-text-muted text-[17px] focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all mb-4 relative z-10"
          />

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-2 relative z-10" style={{ scrollbarWidth: 'none' }}>
            {bodyParts.map(part => (
              <button
                key={part}
                onClick={() => handleSelectBodyPart(part)}
                className={`px-4 py-1.5 rounded-full text-[14px] flex items-center whitespace-nowrap transition-colors border ${
                  selectedPart === part
                    ? 'bg-blue-500 text-white font-semibold border-blue-400 shadow-lg shadow-blue-500/30'
                    : 'bg-white/5 text-text-muted border-white/5 hover:bg-white/10 active:scale-95'
                }`}
              >
                {part === 'all' ? 'Tous les muscles' : part.charAt(0).toUpperCase() + part.slice(1)}
              </button>
            ))}
          </div>

          <div className="ios-card w-full flex divide-x divide-white/10 overflow-hidden mt-3 relative z-10 border border-white/5 shadow-lg shadow-black/50">
            <div className="flex-1 flex flex-col items-center py-2 px-1 bg-gradient-to-b from-white/[0.03] to-transparent">
              <span className="text-[11px] font-bold tracking-wider text-blue-400 uppercase mb-1">Séries</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setSets(Math.max(1, sets - 1))} className="text-blue-400 text-2xl active:opacity-50 w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-500/10">−</button>
                <span className="w-6 text-center text-[19px] font-bold text-white">{sets}</span>
                <button onClick={() => setSets(Math.min(20, sets + 1))} className="text-blue-400 text-2xl active:opacity-50 w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-500/10">+</button>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center py-2 px-1 bg-gradient-to-b from-white/[0.03] to-transparent">
               <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase mb-1">Reps</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setReps(Math.max(1, reps - 1))} className="text-emerald-400 text-2xl active:opacity-50 w-8 h-8 flex items-center justify-center rounded-full hover:bg-emerald-500/10">−</button>
                <span className="w-6 text-center text-[19px] font-bold text-white">{reps}</span>
                <button onClick={() => setReps(Math.min(100, reps + 1))} className="text-emerald-400 text-2xl active:opacity-50 w-8 h-8 flex items-center justify-center rounded-full hover:bg-emerald-500/10">+</button>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center py-2 px-1 bg-gradient-to-b from-white/[0.03] to-transparent">
               <span className="text-[11px] font-bold tracking-wider text-purple-400 uppercase mb-1">Repos</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setRestTime(Math.max(10, restTime - 10))} className="text-purple-400 text-xl active:opacity-50 w-6 h-6 flex items-center justify-center rounded-full hover:bg-purple-500/10">−</button>
                <span className="w-8 text-center text-[17px] font-bold text-white">{restTime}s</span>
                <button onClick={() => setRestTime(Math.min(300, restTime + 10))} className="text-purple-400 text-xl active:opacity-50 w-6 h-6 flex items-center justify-center rounded-full hover:bg-purple-500/10">+</button>
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-12 pt-4 bg-app-bg relative">
          {loading ? (
             <div className="flex flex-col items-center justify-center mt-20 gap-4">
               <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               <span className="text-[15px] font-medium text-blue-400 animate-pulse">Chargement API...</span>
             </div>
          ) : exercises.length === 0 ? (
             <div className="text-center mt-20 flex flex-col items-center">
               <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-2xl">🔍</div>
               <span className="text-[17px] font-medium text-white mb-1">Aucun résultat</span>
               <span className="text-[15px] text-text-muted">Essayez un autre terme de recherche.</span>
             </div>
          ) : (
             <div className="flex flex-col gap-2">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id || `exercise-${index}`}
                  className="ios-card p-3 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer border border-white/5 hover:border-white/10 group relative overflow-hidden"
                  onClick={() => handleAdd(exercise)}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/[0.05] to-transparent rounded-bl-full pointer-events-none group-hover:from-blue-500/10"></div>
                  
                  {exercise.gifUrl ? (
                    <img src={exercise.gifUrl} alt={exercise.name} className="w-14 h-14 rounded-[14px] object-cover bg-white opacity-95 group-hover:opacity-100 shadow-md" loading="lazy" />
                  ) : (
                    <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      🏋️
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[17px] font-bold text-white capitalize truncate mb-1.5 leading-tight">{exercise.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTargetColor(exercise.target)}`}>
                        {exercise.target}
                      </span>
                      <span className="text-[11px] font-medium tracking-wide text-text-muted bg-white/5 px-2 py-0.5 rounded border border-white/10 truncate max-w-[100px]">
                        {exercise.equipment}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
