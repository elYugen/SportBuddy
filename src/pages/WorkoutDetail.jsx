import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getWorkoutById } from '../services/storage'
import { addCompletedSession } from '../services/storage'
import RestTimer from '../components/RestTimer'

export default function WorkoutDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState(null)

  // Session state
  const [isRunning, setIsRunning] = useState(false)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [showTimer, setShowTimer] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [completedExercises, setCompletedExercises] = useState([])

  useEffect(() => {
    const w = getWorkoutById(id)
    if (!w) {
      navigate('/workouts')
      return
    }
    setWorkout(w)
  }, [id, navigate])

  if (!workout) return null

  const currentExercise = workout.exercises[currentExerciseIndex]
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0)
  const completedSets = completedExercises.reduce((sum, ex) => sum + ex.completedSets, 0) + (currentSet - 1)

  function handleStart() {
    setIsRunning(true)
    setCurrentExerciseIndex(0)
    setCurrentSet(1)
    setShowTimer(false)
    setIsCompleted(false)
    setCompletedExercises([])
  }

  function handleSetDone() {
    if (currentSet < currentExercise.sets) {
      setCurrentSet(prev => prev + 1)
      setShowTimer(true)
    } else {
      setCompletedExercises(prev => [
        ...prev,
        { name: currentExercise.name, completedSets: currentExercise.sets }
      ])

      if (currentExerciseIndex < workout.exercises.length - 1) {
        setShowTimer(true)
      } else {
        finishWorkout()
      }
    }
  }

  function handleTimerComplete() {
    setShowTimer(false)
    if (currentSet > currentExercise.sets) {
      setCurrentExerciseIndex(prev => prev + 1)
      setCurrentSet(1)
    }
  }

  function handleTimerSkip() {
    handleTimerComplete()
  }

  function finishWorkout() {
    setIsCompleted(true)
    setIsRunning(false)
    addCompletedSession({
      workoutId: workout.id,
      workoutName: workout.name,
      exerciseCount: workout.exercises.length,
    })
  }

  // === Completion Screen ===
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-5xl shadow-xl shadow-emerald-500/40 mb-6 animate-slide-up">
          🏆
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Séance terminée</h2>
        <p className="text-[17px] text-emerald-400 font-medium mb-8 text-center">{workout.name}</p>

        <div className="ios-card w-full flex mb-8 divide-x divide-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none"></div>
          <div className="flex-1 p-6 text-center relative z-10">
            <div className="text-4xl font-bold text-white mb-1">{workout.exercises.length}</div>
            <div className="text-[13px] text-text-muted uppercase tracking-wider font-semibold">Exercices</div>
          </div>
          <div className="flex-1 p-6 text-center relative z-10">
            <div className="text-4xl font-bold text-white mb-1">{totalSets}</div>
            <div className="text-[13px] text-text-muted uppercase tracking-wider font-semibold">Séries</div>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[17px] font-semibold active:opacity-70 shadow-lg shadow-emerald-500/20"
        >
          Terminer
        </button>
      </div>
    )
  }

  // === Active Session ===
  if (isRunning) {
    const progressPercent = Math.round((completedSets / totalSets) * 100)
    return (
      <div className="px-4 py-8 flex flex-col h-[calc(100vh-80px)] pb-safe relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
           <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
        </div>
        
        <div className="flex items-center justify-between mb-6 mt-2">
          <button onClick={() => { setIsRunning(false); setShowTimer(false) }} className="text-text-muted hover:text-white px-3 py-1.5 rounded-lg bg-white/5 font-medium text-[15px] active:opacity-70 transition-colors">
            Quitter
          </button>
          <div className="text-[14px] font-bold tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 shadow-sm shadow-blue-500/10">
            {progressPercent}% complété
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-app-card rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 via-purple-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
           
          {showTimer ? (
             <div className="flex-1 flex flex-col items-center justify-center p-6 bg-app-card/50 relative z-10">
               <h3 className="text-[17px] font-medium text-blue-400 mb-8 tracking-wide">Temps de récupération</h3>
               <div className="w-full max-w-[280px] mx-auto scale-110">
                 <RestTimer
                   duration={currentExercise.restTime || 60}
                   onComplete={handleTimerComplete}
                   onSkip={handleTimerSkip}
                 />
               </div>
               <button onClick={handleTimerSkip} className="mt-12 text-white bg-white/10 px-6 py-3 rounded-full text-[17px] font-semibold active:bg-white/20 transition-colors border border-white/10">
                 Passer maintenant
               </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col relative z-10 h-full">
              <div className="text-center p-5 border-b border-white/5 shrink-0 bg-gradient-to-b from-white/[0.03] to-transparent">
                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-2 bg-blue-500/10 px-3 py-1 rounded-full inline-block border border-blue-500/20">
                  Exercice {currentExerciseIndex + 1} / {workout.exercises.length}
                </div>
                <h2 className="text-3xl font-bold text-white capitalize leading-tight mb-2">
                  {currentExercise.name}
                </h2>
              </div>

              <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 bg-app-bg shadow-inner relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
                 
                 {currentExercise.gifUrl ? (
                   <div className="w-full max-w-xs aspect-square border-4 border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative z-10 bg-white">
                     <img 
                       src={currentExercise.gifUrl} 
                       alt={currentExercise.name} 
                       className="w-full h-full object-cover mix-blend-multiply opacity-95"
                       loading="lazy"
                     />
                   </div>
                 ) : (
                   <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-5xl shadow-2xl shadow-indigo-500/20 relative z-10">
                     🏋️
                   </div>
                 )}
              </div>

              <div className="shrink-0 p-5 sm:p-6 bg-app-card border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
                 <div className="flex justify-between items-center mb-5">
                   <div className="text-center bg-white/5 px-6 py-3 rounded-2xl border border-white/5 flex-1 mr-2 shadow-inner">
                     <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Série</div>
                     <div className="text-3xl font-black text-white">{currentSet}<span className="text-xl font-semibold text-text-muted ml-0.5">/{currentExercise.sets}</span></div>
                   </div>
                   <div className="text-center bg-white/5 px-6 py-3 rounded-2xl border border-white/5 flex-1 ml-2 shadow-inner">
                     <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Objectif</div>
                     <div className="text-3xl font-black text-blue-400">{currentExercise.reps}</div>
                   </div>
                 </div>

                <button
                  onClick={handleSetDone}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[19px] font-bold active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 border border-blue-400/30"
                >
                  Valider
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // === Detail View ===
  return (
    <div className="px-4 py-8 space-y-6 pb-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

      <div className="flex items-center mb-2 relative z-10">
        <button onClick={() => navigate('/workouts')} className="flex items-center text-blue-400 text-[17px] font-medium hover:bg-white/5 active:bg-white/10 px-3 py-1.5 -ml-3 rounded-lg transition-colors">
          <svg className="w-5 h-5 mr-1 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
      </div>

      <div className="relative z-10">
        <h1 className="text-4xl font-black text-white tracking-tight mb-3 leading-tight drop-shadow-md">{workout.name}</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
           <span className="text-[12px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg shadow-sm">
             {workout.exercises?.length || 0} exos
           </span>
           <span className="text-[13px] font-medium text-white/80 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
             ~{workout.exercises?.reduce((sum, ex) => sum + ex.sets * ex.reps, 0)} reps totales
           </span>
        </div>
      </div>

      {workout.exercises && workout.exercises.length > 0 && (
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 text-white text-[18px] font-bold active:scale-95 transition-all text-center flex justify-center items-center gap-2 relative z-10 border border-blue-400/20"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          Démarrer l'entraînement
        </button>
      )}

      <div className="relative z-10 mt-6">
        <h2 className="text-[14px] font-bold text-text-muted uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
          Exercices
        </h2>
        <div className="ios-card flex flex-col border border-white/5 shadow-xl shadow-black overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
          {workout.exercises?.map((exercise, index) => (
            <div key={index} className="ios-list-item py-4 px-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors relative z-10">
              {exercise.gifUrl ? (
                <div className="w-12 h-12 rounded-[14px] bg-white overflow-hidden shadow-inner border border-white/10 shrink-0 relative">
                  <img src={exercise.gifUrl} alt="" className="w-full h-full object-cover mix-blend-multiply opacity-90" loading="lazy" />
                  <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-[9px] font-bold px-1.5 rounded-tl-md">
                    {index + 1}
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 text-[15px] font-black flex items-center justify-center shrink-0 shadow-inner">
                  {index + 1}
                </div>
              )}
              
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-[17px] font-bold text-white capitalize truncate mb-1">
                  {exercise.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                   <span className="text-[11px] font-bold tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded shadow-sm">
                     {exercise.sets}<span className="text-[9px] mx-0.5">X</span>{exercise.reps}
                   </span>
                   <span className="text-[11px] font-semibold text-text-muted bg-white/5 px-2 py-0.5 rounded border border-white/10 shadow-sm">
                     {exercise.restTime}s repos
                   </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
