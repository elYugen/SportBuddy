import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWorkouts, saveWorkout, deleteWorkout } from '../services/storage'
import ExercisePicker from '../components/ExercisePicker'

export default function Workouts() {
  const navigate = useNavigate()
  const [workouts, setWorkouts] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [newName, setNewName] = useState('')
  const [newExercises, setNewExercises] = useState([])
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    setWorkouts(getWorkouts())
  }, [])

  function handleCreate() {
    if (!newName.trim() || newExercises.length === 0) return
    saveWorkout({
      name: newName.trim(),
      exercises: newExercises,
    })
    setWorkouts(getWorkouts())
    setIsCreating(false)
    setNewName('')
    setNewExercises([])
  }

  function handleDeleteClick(id, e) {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setConfirmDeleteId(id)
  }

  function handleConfirmDelete(id, e) {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    deleteWorkout(id)
    setWorkouts(getWorkouts())
    setConfirmDeleteId(null)
  }

  function handleCancelDelete(e) {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setConfirmDeleteId(null)
  }

  function handleAddExercise(exercise) {
    setNewExercises(prev => [...prev, exercise])
    setShowPicker(false)
  }

  function handleRemoveExercise(index) {
    setNewExercises(prev => prev.filter((_, i) => i !== index))
  }

  function moveExercise(index, direction) {
    setNewExercises(prev => {
      const arr = [...prev]
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= arr.length) return arr
      ;[arr[index], arr[newIndex]] = [arr[newIndex], arr[index]]
      return arr
    })
  }

  return (
    <div className="px-4 py-8 space-y-6 pb-24">
      <div className="flex items-center justify-between mb-4 mt-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Programmes</h1>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="text-blue-400 font-semibold text-[17px] active:opacity-70 px-3 py-1.5 rounded-lg bg-blue-500/10"
          >
            Nouveau
          </button>
        )}
      </div>

      {isCreating && (
        <div className="animate-fade-in space-y-6">
          <div className="ios-card overflow-hidden border border-white/5 relative shadow-xl shadow-black">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
            <div className="p-4 border-b border-white/[0.15] bg-white/5">
              <input
                type="text"
                placeholder="Nom du programme (ex: PUSH)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full text-white placeholder-text-muted text-[17px] font-semibold focus:outline-none bg-transparent"
                autoFocus
              />
            </div>
            
            <div className="flex flex-col px-4 relative z-10">
              {newExercises.length > 0 ? (
                newExercises.map((ex, index) => (
                  <div key={index} className="ios-list-item py-3 flex items-center gap-3">
                    <div className="flex flex-col gap-2 shrink-0 border-r border-white/10 pr-3">
                      <button type="button" onClick={() => moveExercise(index, -1)} disabled={index === 0} className="text-text-muted disabled:opacity-30 active:opacity-70">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button type="button" onClick={() => moveExercise(index, 1)} disabled={index === newExercises.length - 1} className="text-text-muted disabled:opacity-30 active:opacity-70">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[17px] font-medium text-white truncate capitalize">{ex.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[12px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                          {ex.sets}x{ex.reps}
                        </span>
                        <span className="text-[12px] font-medium text-text-muted bg-white/5 px-2 py-0.5 rounded-md">
                          {ex.restTime}s
                        </span>
                      </div>
                    </div>

                    <button type="button" onClick={() => handleRemoveExercise(index)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center active:bg-red-500/20 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                     <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <span className="text-text-muted text-[15px]">Construisez votre programme</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-white/[0.15]">
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="w-full py-4 text-blue-400 font-semibold text-[17px] active:bg-app-surface transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Ajouter un exercice
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => { setIsCreating(false); setNewName(''); setNewExercises([]) }}
              className="flex-1 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-[17px] font-semibold active:bg-app-surface transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || newExercises.length === 0}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 text-white text-[17px] font-semibold disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all"
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Workout List */}
      {!isCreating && (
        <>
          {workouts.length === 0 ? (
             <div className="py-10 text-center text-text-muted text-[15px]">
              Aucun programme pour le moment.
            </div>
          ) : (
            <div className="ios-card flex flex-col px-4 border border-white/5 shadow-xl shadow-black relative overflow-hidden">
               <div className="absolute top-0 right-0 w-full h-24 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="ios-list-item py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 active:bg-white/5 transition-colors cursor-pointer group relative z-10"
                  onClick={() => confirmDeleteId !== workout.id && navigate(`/workouts/${workout.id}`)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                    <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shadow-inner shrink-0">
                       <svg className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                       </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[17px] font-semibold text-white truncate mb-0.5">
                        {workout.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                          {workout.exercises?.length || 0} exos
                        </span>
                        <span className="text-[12px] text-text-muted">
                          {new Date(workout.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {confirmDeleteId === workout.id ? (
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <button
                        onClick={(e) => handleCancelDelete(e)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-[14px] font-medium active:bg-white/20 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={(e) => handleConfirmDelete(workout.id, e)}
                        className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[14px] font-bold shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={e => handleDeleteClick(workout.id, e)}
                        className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center active:bg-red-500/20 transition-colors z-20"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      <svg className="w-5 h-5 text-text-muted opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showPicker && (
        <ExercisePicker
          onAdd={handleAddExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
