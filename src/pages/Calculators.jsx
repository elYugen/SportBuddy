import { useState, useEffect } from 'react'
import { getProfile, getLatestWeight } from '../services/storage'

export default function Calculators() {
  const [profile, setProfile] = useState(null)
  const [weight, setWeight] = useState(null)

  useEffect(() => {
    setProfile(getProfile())
    setWeight(getLatestWeight())
  }, [])

  if (!profile || !weight) {
    return (
       <div className="px-4 py-12 pb-24 text-center">
         <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-3xl mx-auto mb-4 border border-blue-500/20">👤</div>
         <h2 className="text-xl font-bold text-white mb-2">Profil incomplet</h2>
         <p className="text-text-muted text-[15px] max-w-[250px] mx-auto">Veuillez d'abord remplir votre taille, âge et poids dans l'onglet Profil.</p>
       </div>
    )
  }

  const h = parseFloat(profile.height)
  const w = parseFloat(weight)
  const a = parseInt(profile.age, 10)
  const activity = parseFloat(profile.activity)
  const isMale = profile.gender === 'M'

  if (!h || !w || !a) {
    return (
       <div className="px-4 py-12 pb-24 text-center">
         <p className="text-text-muted">Données de profil invalides. Veuillez vérifier l'onglet Profil.</p>
       </div>
    )
  }

  // --- IMC (BMI) ---
  const imc = w / ((h / 100) * (h / 100))
  let imcCategory = ''
  let imcColor = ''
  let imcPercentage = 0 // 0 to 100 for a visual gauge (extrema: 15 to 40)

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
  
  // Normalize IMC for gauge (15 = 0%, 40 = 100%)
  imcPercentage = Math.max(0, Math.min(100, ((imc - 15) / (40 - 15)) * 100))

  // --- TDEE (Mifflin-St Jeor) ---
  let bmr = isMale
    ? 10 * w + 6.25 * h - 5 * a + 5
    : 10 * w + 6.25 * h - 5 * a - 161
  
  const tdee = Math.round(bmr * activity)
  
  // --- Macros (Maintenance Base) ---
  // Standard fitness split: Protein = 2.2g/kg, Fat = 1g/kg, Carbs = Rest
  const proteinGrams = Math.round(w * 2.2)
  const fatGrams = Math.round(w * 1.0)
  const proteinCals = proteinGrams * 4
  const fatCals = fatGrams * 9
  const carbCals = tdee - (proteinCals + fatCals)
  const carbGrams = Math.max(0, Math.round(carbCals / 4))

  return (
    <div className="px-4 py-10 pb-24 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Outils</h1>
        <p className="text-text-muted text-[15px]">Analyses basées sur vos mensurations.</p>
      </div>

      {/* IMC Block */}
      <div className="ios-card overflow-hidden border border-white/5 relative p-5 shadow-lg shadow-black">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-semibold text-white tracking-tight">Index de Masse Corporelle</h2>
        </div>
        
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full border-[6px] border-white/10 flex items-center justify-center relative shadow-inner">
             {/* Simple pseudo-gauge logic based on standard limits */}
             <div className="text-2xl font-black text-white">{imc.toFixed(1)}</div>
          </div>
          <div className="flex-1">
             <div className={`inline-block px-3 py-1 rounded-md text-[13px] font-bold uppercase tracking-wider border mb-2 ${imcColor}`}>
               {imcCategory}
             </div>
             <p className="text-[13px] text-text-muted leading-tight">
               L'IMC est un indicateur de corpulence. Un poids santé se situe typiquement entre 18.5 et 25.
             </p>
          </div>
        </div>

        {/* Visual Gauge Bar */}
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

      {/* TDEE & Macros Block */}
      <div className="ios-card overflow-hidden border border-white/5 relative p-5 shadow-lg shadow-black">
         <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
         <h2 className="text-[17px] font-semibold text-white tracking-tight mb-1 relative z-10">Dépense Énergétique (TDEE)</h2>
         <p className="text-[13px] text-text-muted mb-6 relative z-10">Calories requises pour <b>maintenir</b> votre poids actuel.</p>

         <div className="flex items-center justify-center bg-black/40 rounded-2xl py-6 mb-6 border border-white/5 shadow-inner relative z-10">
           <div className="text-center text-indigo-400 text-3xl mr-2 font-light">🔥</div>
           <div className="flex flex-col">
             <span className="text-4xl font-black text-white tracking-tight leading-none">{tdee}</span>
             <span className="text-[13px] font-bold text-indigo-400/80 uppercase tracking-widest mt-1">kcal / jour</span>
           </div>
         </div>

         <h3 className="text-[15px] font-semibold text-white mb-4 relative z-10">Macros recommandés (Maintien)</h3>
         
         <div className="grid grid-cols-3 gap-3 relative z-10">
           <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center">
             <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Protéines</span>
             <span className="text-xl font-bold text-white mb-0.5">{proteinGrams}g</span>
             <span className="text-[10px] text-text-muted">~2.2g / kg</span>
           </div>
           
           <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center">
             <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">Glucides</span>
             <span className="text-xl font-bold text-white mb-0.5">{carbGrams}g</span>
             <span className="text-[10px] text-text-muted">Reste</span>
           </div>
           
           <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center">
             <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1">Lipides</span>
             <span className="text-xl font-bold text-white mb-0.5">{fatGrams}g</span>
             <span className="text-[10px] text-text-muted">~1g / kg</span>
           </div>
         </div>
         
         {/* Visual macro bar */}
         <div className="flex h-1.5 w-full rounded-full overflow-hidden mt-4 opacity-80">
            <div className="bg-emerald-500" style={{ width: `${(proteinCals/tdee)*100}%` }}></div>
            <div className="bg-amber-500" style={{ width: `${(carbCals/tdee)*100}%` }}></div>
            <div className="bg-rose-500" style={{ width: `${(fatCals/tdee)*100}%` }}></div>
         </div>
      </div>
    </div>
  )
}
