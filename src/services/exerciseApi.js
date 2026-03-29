const OFFLINE_FALLBACK = [
  { id: '1', name: 'Pompes (Push Ups)', bodyPart: 'chest', target: 'pectorals', equipment: 'body weight', gifUrl: null },
  { id: '2', name: 'Tractions (Pull Ups)', bodyPart: 'back', target: 'lats', equipment: 'body weight', gifUrl: null },
  { id: '3', name: 'Squats', bodyPart: 'upper legs', target: 'quads', equipment: 'body weight', gifUrl: null },
  { id: '4', name: 'Développé Couché', bodyPart: 'chest', target: 'pectorals', equipment: 'barbell', gifUrl: null },
  { id: '5', name: 'Soulevé de Terre', bodyPart: 'back', target: 'glutes', equipment: 'barbell', gifUrl: null },
  { id: '6', name: 'Fentes (Lunges)', bodyPart: 'upper legs', target: 'quads', equipment: 'body weight', gifUrl: null },
];

function normalizeExercise(ex) {
  if (!ex) return null;
  return {
    id: ex.exerciseId || ex.id || String(Math.random()),
    name: ex.name || 'Exercice inconnu',
    bodyPart: Array.isArray(ex.bodyParts) && ex.bodyParts.length > 0 ? ex.bodyParts[0] : (ex.bodyPart || 'inconnu'),
    target: Array.isArray(ex.targetMuscles) && ex.targetMuscles.length > 0 ? ex.targetMuscles[0] : (ex.target || 'inconnu'),
    equipment: Array.isArray(ex.equipments) && ex.equipments.length > 0 ? ex.equipments[0] : (ex.equipment || 'inconnu'),
    gifUrl: ex.gifUrl || null,
  };
}

function extractDataList(responseBody) {
  if (!responseBody) return [];
  if (Array.isArray(responseBody)) return responseBody;
  if (responseBody.data && Array.isArray(responseBody.data)) return responseBody.data;
  if (responseBody.success && responseBody.data) {
    if (Array.isArray(responseBody.data)) return responseBody.data;
    if (responseBody.data.exercises && Array.isArray(responseBody.data.exercises)) return responseBody.data.exercises;
  }
  return [];
}

const BASE_URL = 'https://exercisedb-api.vercel.app/api/v1';

export async function fetchExercisesByBodyPart(part = null, limit = 50) {
  try {
    const targetUrl = part && part !== 'all'
      ? `${BASE_URL}/exercises/bodyPart/${part}?limit=${limit}`
      : `${BASE_URL}/exercises?limit=${limit}`;
      
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    
    const body = await res.json();
    const dataList = extractDataList(body);
    
    if (dataList.length === 0) return [];
    
    return dataList.map(normalizeExercise).filter(Boolean);
  } catch (error) {
    console.warn(`Fallback active for body part: ${part}`, error);
    if (!part || part === 'all') return OFFLINE_FALLBACK;
    return OFFLINE_FALLBACK.filter(e => e.bodyPart.toLowerCase() === part.toLowerCase());
  }
}

export async function fetchBodyParts() {
  try {
    const res = await fetch(`${BASE_URL}/bodyParts`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    
    const body = await res.json();
    if (body.success && Array.isArray(body.data)) return body.data;
    if (Array.isArray(body)) return body;
    throw new Error('Invalid format');
  } catch (error) {
    console.warn('Fallback active for body parts:', error);
    return [...new Set(OFFLINE_FALLBACK.map(e => e.bodyPart))];
  }
}

export async function searchExercises(query, limit = 50) {
  try {
    const targetUrl = `${BASE_URL}/exercises/name/${query}?limit=${limit}`;
    const res = await fetch(targetUrl);
    
    // Handle 404 (Not Found) gracefully returning empty array instead of throwing error
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    
    const body = await res.json();
    const dataList = extractDataList(body);
    
    return dataList.map(normalizeExercise).filter(Boolean);
  } catch (error) {
    console.warn(`Fallback active for search: ${query}`, error);
    const lowerQuery = query.toLowerCase();
    return OFFLINE_FALLBACK.filter(e => 
      e.name.toLowerCase().includes(lowerQuery) || 
      e.target.toLowerCase().includes(lowerQuery)
    );
  }
}
