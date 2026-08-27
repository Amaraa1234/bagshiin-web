// ============================================================
// js/auth.js - Хэрэглэгчийн нэвтрэлт, бүртгэл, гарах функцууд
// ============================================================
import { supabase } from './supabase.js';

/**
 * Auth класс - бүх нэвтрэлттэй холбоотой үйлдлүүд
 */
export class Auth {
    /**
     * Одоогийн хэрэглэгчийн мэдээллийг авах
     * @returns {Promise<Object|null>} Хэрэглэгчийн мэдээлэл эсвэл null
     */
    static async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('Auth getCurrentUser error:', error.message);
            return null;
        }
    }

    /**
     * Одоогийн сессийг авах
     * @returns {Promise<Object|null>} Сессийн мэдээлэл эсвэл null
     */
    static async getSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            return session;
        } catch (error) {
            console.error('Auth getSession error:', error.message);
            return null;
        }
    }

    /**
     * Имэйл, нууц үгээр нэвтрэх
     * @param {string} email - Хэрэглэгчийн имэйл
     * @param {string} password - Нууц үг
     * @returns {Promise<Object>} { user, session, error }
     */
    static async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });

            if (error) {
                return { user: null, session: null, error: error.message };
            }

            return { 
                user: data.user, 
                session: data.session, 
                error: null 
            };
        } catch (error) {
            console.error('Auth signIn error:', error);
            return { user: null, session: null, error: error.message };
        }
    }

    /**
     * Шинэ хэрэглэгч бүртгүүлэх
     * @param {string} email - Хэрэглэгчийн имэйл
     * @param {string} password - Нууц үг
     * @param {Object} metadata - Нэмэлт мэдээлэл (full_name, role гэх мэт)
     * @returns {Promise<Object>} { user, session, error }
     */
    static async signUp(email, password, metadata = {}) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    data: {
                        full_name: metadata.full_name || '',
                        role: metadata.role || 'student',
                        ...metadata
                    }
                }
            });

            if (error) {
                return { user: null, session: null, error: error.message };
            }

            return { 
                user: data.user, 
                session: data.session, 
                error: null 
            };
        } catch (error) {
            console.error('Auth signUp error:', error);
            return { user: null, session: null, error: error.message };
        }
    }

    /**
     * Системээс гарах
     * @returns {Promise<Object>} { error }
     */
    static async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Auth signOut error:', error.message);
            return { error: error.message };
        }
    }

    /**
     * Нууц үг солих хүсэлт илгээх
     * @param {string} email - Хэрэглэгчийн имэйл
     * @returns {Promise<Object>} { error }
     */
    static async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: window.location.origin + '/reset-password.html'
            });
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Auth resetPassword error:', error.message);
            return { error: error.message };
        }
    }

    /**
     * Нууц үг шинэчлэх
     * @param {string} newPassword - Шинэ нууц үг
     * @returns {Promise<Object>} { error }
     */
    static async updatePassword(newPassword) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Auth updatePassword error:', error.message);
            return { error: error.message };
        }
    }

    /**
     * Хэрэглэгчийн профайлыг шинэчлэх
     * @param {Object} updates - Шинэчлэх өгөгдөл
     * @returns {Promise<Object>} { user, error }
     */
    static async updateProfile(updates) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: updates
            });
            if (error) throw error;
            return { user: data.user, error: null };
        } catch (error) {
            console.error('Auth updateProfile error:', error.message);
            return { user: null, error: error.message };
        }
    }

    /**
     * Хэрэглэгч нэвтэрсэн эсэхийг шалгах (Guard)
     * @param {string} redirectUrl - Нэвтрээгүй үед чиглүүлэх URL
     * @returns {Promise<boolean>} Нэвтэрсэн эсэх
     */
    static async requireAuth(redirectUrl = '/login.html') {
        const session = await this.getSession();
        if (!session) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    /**
     * Багш эрхтэй эсэхийг шалгах (Guard)
     * @param {string} redirectUrl - Эрхгүй үед чиглүүлэх URL
     * @returns {Promise<boolean>} Багш эсэх
     */
    static async requireTeacher(redirectUrl = '/dashboard.html') {
        const user = await this.getCurrentUser();
        if (!user) {
            window.location.href = '/login.html';
            return false;
        }
        const role = user.user_metadata?.role || 'student';
        if (role !== 'teacher' && role !== 'admin') {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    /**
     * Хэрэглэгчийн үүргийг авах
     * @returns {Promise<string>} 'teacher', 'student', 'admin' эсвэл 'guest'
     */
    static async getRole() {
        const user = await this.getCurrentUser();
        if (!user) return 'guest';
        return user.user_metadata?.role || 'student';
    }

    /**
     * Хэрэглэгчийн бүтэн нэрийг авах
     * @returns {Promise<string>} Бүтэн нэр эсвэл имэйл
     */
    static async getDisplayName() {
        const user = await this.getCurrentUser();
        if (!user) return 'Зочин';
        return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Хэрэглэгч';
    }
}

// Export default
export default Auth;