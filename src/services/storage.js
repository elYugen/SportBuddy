const WEIGHT_KEY = 'fitness_weight_entries';
const WORKOUTS_KEY = 'fitness_workouts';
const SESSIONS_KEY = 'fitness_sessions';
const PROFILE_KEY = 'fitness_profile';

// Profile
export function getProfile() {
  const defaultProfile = { height: '', age: '', gender: 'M', activity: '1.2' };
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? { ...defaultProfile, ...JSON.parse(data) } : defaultProfile;
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// Weight
export function getWeightEntries() {
  const data = localStorage.getItem(WEIGHT_KEY);
  if (!data) return [];
  
  let entries = JSON.parse(data);
  // Migrate and normalize legacy dates from '10 Apr' to ISO 'YYYY-MM-DD' safely
  entries = entries.map(e => {
    if (e.date && !e.date.includes('-')) {
      const parts = e.date.split(' ');
      if (parts.length >= 2) {
        const months = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12', 
                         'janv.': '01', 'févr.': '02', 'mars': '03', 'avr.': '04', 'mai': '05', 'juin': '06', 'juil.': '07', 'août': '08', 'sept.': '09', 'oct.': '10', 'nov.': '11', 'déc.': '12' };
        let month = '01';
        for (const [key, val] of Object.entries(months)) {
          if (parts[1].toLowerCase().startsWith(key.toLowerCase().replace('.', ''))) month = val;
        }
        const day = parts[0].padStart(2, '0');
        e.date = `${new Date().getFullYear()}-${month}-${day}`;
      }
    }
    return e;
  });
  
  // Safe temporal sort
  entries.sort((a, b) => {
    const da = new Date(a.date).getTime() || 0;
    const db = new Date(b.date).getTime() || 0;
    return da - db;
  });
  
  return entries;
}

export function addWeightEntry(date, weight) {
  const entries = getWeightEntries();
  const entry = {
    id: Date.now().toString(),
    date,
    weight: parseFloat(weight),
  };
  
  entries.push(entry);
  
  entries.sort((a, b) => {
    const da = new Date(a.date).getTime() || 0;
    const db = new Date(b.date).getTime() || 0;
    return da - db;
  });
  
  localStorage.setItem(WEIGHT_KEY, JSON.stringify(entries));
  return entry;
}

export function deleteWeightEntry(id) {
  const entries = getWeightEntries().filter(e => e.id !== id);
  localStorage.setItem(WEIGHT_KEY, JSON.stringify(entries));
}

export function getLatestWeight() {
  const entries = getWeightEntries();
  return entries.length > 0 ? entries[entries.length - 1].weight : null;
}

// Workouts
export function getWorkouts() {
  const data = localStorage.getItem(WORKOUTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getWorkoutById(id) {
  return getWorkouts().find(w => w.id === id) || null;
}

export function saveWorkout(workout) {
  const workouts = getWorkouts();
  const existing = workouts.findIndex(w => w.id === workout.id);
  if (existing >= 0) {
    workouts[existing] = workout;
  } else {
    workout.id = Date.now().toString();
    workout.createdAt = new Date().toISOString();
    workouts.push(workout);
  }
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  return workout;
}

export function deleteWorkout(id) {
  const workouts = getWorkouts().filter(w => w.id !== id);
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

// Sessions
export function getCompletedSessions() {
  const data = localStorage.getItem(SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function addCompletedSession(session) {
  const sessions = getCompletedSessions();
  sessions.push({
    ...session,
    id: Date.now().toString(),
    completedAt: new Date().toISOString(),
  });
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}
