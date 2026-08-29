// js/auth.js - Хэрэглэгчийн баталгаажуулалт ба профайл удирдлагын модуль
import { supabase } from './supabase.js';

const Auth = {
    /**
     * Шинэ хэрэглэгч бүртгэх функц
     * @param {string} email - Имэйл хаяг
     * @param {string} password - Нууц үг
     * @param {Object} metadata - Хэрэглэгчийн нэмэлт мэдээлэл (full_name, role, grade, subject)
     */
    async signUp(email, password, metadata = {}) {
        try {
            // 1. Supabase Auth дээр шинэ хэрэглэгч үүсгэх
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: metadata.full_name,
                        role: metadata.role || 'student',
                        grade: metadata.grade || null,
                        subject: metadata.subject || null
                    }
                }
            });

            if (error) {
                return { data: null, session: null, error: error.message };
            }

            // 2. Сүлжээний баталгаажуулалт шаардлагагүй (Confirm email идэвхгүй) үед
            // profiles хүснэгтэд мэдээллийг шууд нэмэх эсвэл шинэчлэх
            if (data?.user) {
                const profileData = {
                    id: data.user.id,
                    email: email,
                    full_name: metadata.full_name,
                    role: metadata.role || 'student',
                    grade: metadata.role === 'student' ? metadata.grade : null,
                    subject: metadata.role === 'student' ? metadata.subject : null,
                    created_at: new Date().toISOString()
                };

                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert(profileData);

                if (profileError) {
                    console.warn('Profile record warning:', profileError.message);
                }
            }

            return { 
                user: data.user, 
                session: data.session, 
                error: null 
            };

        } catch (err) {
            console.error('SignUp Exception:', err);
            return { data: null, session: null, error: err.message || 'Бүртгэл хийхэд алдаа гарлаа' };
        }
    },

    /**
     * Хэрэглэгч нэвтрэх функц
     * @param {string} email - Имэйл хаяг
     * @param {string} password - Нууц үг
     */
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return { user: null, session: null, error: error.message };
            }

            return {
                user: data.user,
                session: data.session,
                error: null
            };

        } catch (err) {
            console.error('SignIn Exception:', err);
            return { user: null, session: null, error: err.message || 'Нэвтрэхэд алдаа гарлаа' };
        }
    },

    /**
     * Системээс гарах функц
     */
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            // Нэвтрэх хуудас руу шилжих
            window.location.href = 'index.html';
            return { error: null };
        } catch (err) {
            console.error('SignOut Exception:', err);
            return { error: err.message };
        }
    },

    /**
     * Одоогийн идэвхтэй сешнийг авах функц
     */
    async getSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            return session;
        } catch (err) {
            console.error('GetSession Exception:', err);
            return null;
        }
    },

    /**
     * Одоо нэвтэрсэн байгаа хэрэглэгчийн профайл мэдээллийг `profiles` хүснэгтээс авах
     */
    async getCurrentUser() {
        try {
            const session = await this.getSession();
            if (!session?.user) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error || !data) {
                // Хэрэв `profiles` хүснэгтэд одоогоор байхгүй бол auth.user-ийн metadata-г буцаана
                return {
                    id: session.user.id,
                    email: session.user.email,
                    full_name: session.user.user_metadata?.full_name || 'Хэрэглэгч',
                    role: session.user.user_metadata?.role || 'student',
                    grade: session.user.user_metadata?.grade || '',
                    subject: session.user.user_metadata?.subject || ''
                };
            }

            return data;
        } catch (err) {
            console.error('GetCurrentUser Exception:', err);
            return null;
        }
    }
};

export default Auth;