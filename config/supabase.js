// NO TOCAR POR FAVOOOOORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
// SIN ESTO NO EXISTE RUTA CON SUPABASE


const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kkkpyenbkuavgewkgzgr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtra3B5ZW5ia3Vhdmdld2tnemdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMjMxMDQsImV4cCI6MjA5MzY5OTEwNH0.r8ly5-YbAwGbYR_YbisA8FoY3RA-PbWY2yyFl76WQ3M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;