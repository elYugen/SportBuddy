import { useState, useEffect } from 'react'
import { getProfile, saveProfile, getLatestWeight, addWeightEntry } from '../services/storage'

export default function Profile() {
  const [profile, setProfile] = useState({ height: '', age: '', gender: 'M', activity: '1.2' })
  const [weight, setWeight] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setProfile(getProfile())
    const lw = getLatestWeight()
    if (lw) setWeight(String(lw))
  }, [])

  function handleSave(e) {
    if (e) e.preventDefault()
    saveProfile({
      height: profile.height,
      age: profile.age,
      gender: profile.gender,
      activity: profile.activity
    })
    
    if (weight && parseFloat(weight) !== getLatestWeight()) {
      // Set to local timezone YYYY-MM-DD to avoid offset issues
      const today = new Date();
      const localDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
      addWeightEntry(localDate, weight);
    }
    
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // Auto-calculate outputs dynamically if valid
  const h = parseFloat(profile.height)
  const w = parseFloat(weight)
  const a = parseInt(profile.age, 10)
  const activity = parseFloat(profile.activity)
  const isMale = profile.gender === 'M'
  const isValid = (h > 50 && w > 20 && a > 0)

  // Calculations
  let imc = 0, imcCategory = '', imcColor = '', imcPercentage = 0
  let tdee = 0, proteinGrams = 0, fatGrams = 0, carbGrams = 0, proteinCals = 0, fatCals = 0, carbCals = 0

  if (isValid) {
    imc = w / ((h / 100) * (h / 100))
    if (imc < 18.5) {
      imcCategory = 'Insuffisance pondérale'
      imcColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    } else if (imc < 25) {
      imcCategory = 'Corpulence normale'
      imcColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    } else if (imc < 30) {
      imcCategory = 'Surpoids'
      imcColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    } else {
      imcCategory = 'Obésité'
      imcColor = 'text-red-400 bg-red-500/10 border-red-500/20'
    }
    imcPercentage = Math.max(0, Math.min(100, ((imc - 15) / (40 - 15)) * 100))

    let bmr = isMale ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161
    tdee = Math.round(bmr * activity)
    
    proteinGrams = Math.round(w * 2.2)
    fatGrams = Math.round(w * 1.0)
    proteinCals = proteinGrams * 4
    fatCals = fatGrams * 9
    carbCals = tdee - (proteinCals + fatCals)
    carbGrams = Math.max(0, Math.round(carbCals / 4))
  }

  return (
    <div className="px-4 py-8 pb-32 space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Profil & Outils</h1>
        <p className="text-text-muted text-[15px]">Paramètres et analyses physiologiques.</p>
      </div>

      <div className="ios-card overflow-hidden shadow-lg shadow-black relative border border-white/5">
         <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
         
        <form onSubmit={handleSave} className="flex flex-col relative z-10">
          <div className="p-5 border-b border-white/10 bg-white/[0.02]">
             <span className="text-[13px] font-bold text-text-muted uppercase tracking-wider block mb-3">Sexe</span>
             <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                <button
                  type="button"
                  onClick={() => { setProfile({...profile, gender: 'M'}); setSaved(false) }}
                  className={`flex-1 py-1.5 text-[15px] rounded-lg font-semibold transition-all ${profile.gender === 'M' ? 'bg-blue-500 text-white shadow-md' : 'text-text-muted hover:text-white'}`}
                >
                  Homme
                </button>
                <button
                  type="button"
                  onClick={() => { setProfile({...profile, gender: 'F'}); setSaved(false) }}
                  className={`flex-1 py-1.5 text-[15px] rounded-lg font-semibold transition-all ${profile.gender === 'F' ? 'bg-rose-500 text-white shadow-md' : 'text-text-muted hover:text-white'}`}
                >
                  Femme
                </button>
             </div>
          </div>

          <div className="flex flex-col">
            <label className="ios-list-item px-5 py-3.5 flex items-center justify-between group">
              <span className="text-[17px] font-medium text-white">Âge</span>
              <div className="flex items-center">
                <input
                  type="number" min="1" max="120"
                  value={profile.age}
                  onChange={e => { setProfile({...profile, age: e.target.value}); setSaved(false) }}
                  onBlur={handleSave}
                  className="w-16 text-right text-[17px] text-white bg-transparent focus:outline-none placeholder-text-muted/50 font-semibold"
                  placeholder="25"
                />
                <span className="ml-2 text-[17px] text-text-muted">ans</span>
              </div>
            </label>

            <label className="ios-list-item px-5 py-3.5 flex items-center justify-between group">
              <span className="text-[17px] font-medium text-white">Taille</span>
              <div className="flex items-center">
                <input
                  type="number" min="50" max="250"
                  value={profile.height}
                  onChange={e => { setProfile({...profile, height: e.target.value}); setSaved(false) }}
                  onBlur={handleSave}
                  className="w-16 text-right text-[17px] text-white bg-transparent focus:outline-none placeholder-text-muted/50 font-semibold"
                  placeholder="175"
                />
                <span className="ml-2 text-[17px] text-text-muted">cm</span>
              </div>
            </label>

            <label className="ios-list-item px-5 py-3.5 flex items-center justify-between group">
              <span className="text-[17px] font-medium text-white">Poids Actuel</span>
              <div className="flex items-center">
                <input
                  type="number" step="0.1" min="20" max="300"
                  value={weight}
                  onChange={e => { setWeight(e.target.value); setSaved(false) }}
                  onBlur={handleSave}
                  className="w-16 text-right text-[17px] text-blue-400 bg-transparent focus:outline-none placeholder-text-muted/50 font-bold"
                  placeholder="70.5"
                />
                <span className="ml-2 text-[17px] text-text-muted">kg</span>
              </div>
            </label>

            <label className="ios-list-item px-5 py-4 flex flex-col justify-center">
              <span className="text-[15px] font-medium text-text-muted mb-2">Activité quotidienne (TDEE)</span>
              <select
                value={profile.activity}
                onChange={e => { setProfile({...profile, activity: e.target.value}); setSaved(false) }}
                onBlur={handleSave}
                className="w-full bg-app-surface text-[15px] text-white p-3 rounded-lg border border-white/5 focus:outline-none font-medium"
              >
                <option value="1.2">Sédentaire (Bureau, pas de sport)</option>
                <option value="1.375">Léger (1 à 3 séances/sem)</option>
                <option value="1.55">Modéré (3 à 5 séances/sem)</option>
                <option value="1.725">Actif (6 à 7 séances/sem)</option>
                <option value="1.9">Intense (Travail physique + sport)</option>
              </select>
            </label>
          </div>

          <div className="p-4 border-t border-white/10 bg-white/[0.02]">
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 text-white text-[17px] font-bold active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              {saved ? (
                <><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Sauvegardé</>
              ) : ('Enregistrer Profile')}
            </button>
          </div>
        </form>
      </div>

      {isValid && (
        <div className="animate-fade-in space-y-6">
          <div className="ios-card overflow-hidden border border-white/5 relative p-5 shadow-lg shadow-black">
            <h2 className="text-[15px] font-semibold text-white tracking-tight mb-4 uppercase text-text-muted">Analyse IMC</h2>
            
            <div className="flex items-center gap-6 mb-5">
              <div className="w-20 h-20 rounded-full border-[6px] border-white/10 flex items-center justify-center relative shadow-inner shrink-0">
                 <div className="text-2xl font-black text-white">{imc.toFixed(1)}</div>
              </div>
              <div className="flex-1">
                 <div className={`inline-block px-3 py-1 rounded-md text-[12px] font-bold uppercase tracking-wider border mb-1.5 ${imcColor}`}>
                   {imcCategory}
                 </div>
                 <p className="text-[13px] text-text-muted leading-tight">
                    Poids de santé standard estimé entre 18.5 et 25.
                 </p>
              </div>
            </div>

            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex relative">
              <div className="h-full bg-blue-500" style={{ width: '14%' }}></div>
              <div className="h-full bg-emerald-500" style={{ width: '26%' }}></div>
              <div className="h-full bg-amber-500" style={{ width: '20%' }}></div>
              <div className="h-full bg-red-500" style={{ width: '40%' }}></div>
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_white]" 
                style={{ left: `${imcPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="ios-card overflow-hidden border border-white/5 relative p-5 shadow-lg shadow-black">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
             
             <h2 className="text-[15px] font-semibold text-white tracking-tight mb-2 uppercase text-text-muted relative z-10">Métabolisme & Besoins</h2>
             
             <div className="flex items-center justify-center bg-black/40 rounded-2xl py-5 mb-5 border border-white/5 shadow-inner relative z-10">
               <div className="text-center text-indigo-400 text-3xl mr-3 font-light">🔥</div>
               <div className="flex flex-col">
                 <span className="text-3xl font-black text-white tracking-tight leading-none">{tdee}</span>
                 <span className="text-[12px] font-bold text-indigo-400/80 uppercase tracking-widest mt-1">kcal / jour (Maintien)</span>
               </div>
             </div>
             
             <div className="grid grid-cols-3 gap-3 relative z-10">
               <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center">
                 <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Prots</span>
                 <span className="text-xl font-bold text-white mb-0.5">{proteinGrams}g</span>
                 <span className="text-[10px] text-text-muted">~2.2g/kg</span>
               </div>
               <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center">
                 <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">Glucides</span>
                 <span className="text-xl font-bold text-white mb-0.5">{carbGrams}g</span>
                 <span className="text-[10px] text-text-muted">Reste</span>
               </div>
               <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center">
                 <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1">Lipides</span>
                 <span className="text-xl font-bold text-white mb-0.5">{fatGrams}g</span>
                 <span className="text-[10px] text-text-muted">~1g/kg</span>
               </div>
             </div>
             <div className="flex h-1.5 w-full rounded-full overflow-hidden mt-4 opacity-80">
                <div className="bg-emerald-500" style={{ width: `${(proteinCals/tdee)*100}%` }}></div>
                <div className="bg-amber-500" style={{ width: `${(carbCals/tdee)*100}%` }}></div>
                <div className="bg-rose-500" style={{ width: `${(fatCals/tdee)*100}%` }}></div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
