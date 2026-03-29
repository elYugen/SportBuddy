import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-app-card/90 backdrop-blur-md border-t border-white/10 pb-safe">
      <div className="max-w-md mx-auto flex justify-around items-center h-[60px]">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-app-accent' : 'text-text-muted hover:text-white'}`
          }
        >
          {({ isActive }) => (
            <>
              <svg className="w-6 h-6 mb-1" fill={isActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 0 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[10px] font-medium">Accueil</span>
            </>
          )}
        </NavLink>

        <NavLink 
          to="/workouts" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-app-accent' : 'text-text-muted hover:text-white'}`
          }
        >
          {({ isActive }) => (
            <>
              <svg className="w-6 h-6 mb-1" fill={isActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 0 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-[10px] font-medium">Programmes</span>
            </>
          )}
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-app-accent' : 'text-text-muted hover:text-white'}`
          }
        >
          {({ isActive }) => (
            <>
              <svg className="w-6 h-6 mb-1" fill={isActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 0 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[10px] font-medium">Profil</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
