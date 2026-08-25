import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = "https://yioswlfvqbdyqnhwmxoc.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpb3N3bGZ2cWJkeXFuaHdteG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4ODMyMzYsImV4cCI6MjEwMjQ1OTIzNn0.uqZeR18PuzxrcWMlS4JXLlAhblCl0HZndMUG3znbtt8"

export const IS_SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

if (supabase.auth) {
    console.log("Холбогдсон байна!")
    console.log(supabase.auth)
}
// ============================================================================
// DB MODULE (Өгөгдлийн баазтай ажиллах хэсэг)
// ============================================================================

export const DB = {
  // 1. Library
  async fetchLibrary() {
    if (!IS_SUPABASE_CONFIGURED) return [];
    const { data, error } = await supabase.from('library').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
  },
  async addLibraryItem(item) {
    if (!IS_SUPABASE_CONFIGURED) return null;
    const { data, error } = await supabase.from('library').insert([item]).select();
    if (error) throw error;
    return data[0];
  },

  // 2. Videos
  async fetchVideos() {
    if (!IS_SUPABASE_CONFIGURED) return [];
    const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
  },

  // 3. Assignments & Submissions
  async fetchAssignments() {
    if (!IS_SUPABASE_CONFIGURED) return [];
    const { data, error } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
  },
  async fetchSubmissions(assignmentId = null) {
    if (!IS_SUPABASE_CONFIGURED) return [];
    let query = supabase.from('submissions').select('*');
    if (assignmentId) query = query.eq('assignment_id', assignmentId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
  },
  async updateGrade(submissionId, grade, feedback) {
    if (!IS_SUPABASE_CONFIGURED) return null;
    const { data, error } = await supabase.from('submissions').update({ grade, feedback, status: 'graded' }).eq('id', submissionId).select();
    if (error) throw error;
    return data[0];
  },

  // 4. Students
  async fetchStudents() {
    if (!IS_SUPABASE_CONFIGURED) return [];
    const { data, error } = await supabase.from('students').select('*').order('full_name', { ascending: true });
    if (error) { console.error(error); return []; }
    return data;
  }
};

window.DB = DB;