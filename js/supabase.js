// KUMG Forge — Supabase client
const SUPABASE_URL = 'https://fcqozytxsbhskddgmbrl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2javbyeCtDyZU3HnEgejMA_oX8dkOD2';

// global Supabase SDK loads as window.supabase
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
