// ============================================================
// js/app.js - Үндсэн програмын контроллер
// ============================================================
import { supabase } from './supabase.js';
import Auth from './auth.js';

/**
 * App класс - програмын үндсэн удирдлага
 */
class App {
    constructor() {
        this.currentUser = null;
        this.currentView = 'dashboard';
        this.initialized = false;
    }

    /**
     * Програмыг эхлүүлэх
     */
    async init() {
        try {
            // Нэвтрэлтийг шалгах
            const session = await Auth.getSession();
            if (session) {
                this.currentUser = await Auth.getCurrentUser();
                this.updateUIForUser();
            }

            // Эвент листенерүүдийг бүртгэх
            this.setupEventListeners();

            // Supabase өөрчлөлтийг сонсох (real-time)
            this.setupRealtimeSubscription();

            this.initialized = true;
            console.log('✅ App амжилттай эхэллээ');
            return true;
        } catch (error) {
            console.error('App init error:', error);
            return false;
        }
    }

    /**
     * UI-г хэрэглэгчийн мэдээллээр шинэчлэх
     */
    updateUIForUser() {
        if (!this.currentUser) return;

        const name = this.currentUser.user_metadata?.full_name || 
                     this.currentUser.email?.split('@')[0] || 
                     'Хэрэглэгч';
        
        // Хэрэглэгчийн нэрийг шинэчлэх
        const greetEl = document.getElementById('greetName');
        if (greetEl) greetEl.textContent = name;

        const railEl = document.getElementById('railUserName');
        if (railEl) railEl.textContent = name;

        const topbarEl = document.getElementById('topbarUserName');
        if (topbarEl) topbarEl.textContent = name;

        // Профайл нэр
        const profileName = document.getElementById('profileName');
        if (profileName && !profileName.value) {
            profileName.value = name;
        }

        // Имэйл
        const profileEmail = document.getElementById('profileEmail');
        if (profileEmail && !profileEmail.value) {
            profileEmail.value = this.currentUser.email || '';
        }

        // Аватар
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2);
            avatar.textContent = initials;
        }
    }

    /**
     * Эвент листенерүүдийг бүртгэх
     */
    setupEventListeners() {
        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', async () => {
            await this.handleLogout();
        });

        // Profile form
        document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleProfileUpdate(e);
        });

        // Navigation
        document.querySelectorAll('.navlink[data-view]').forEach(link => {
            link.addEventListener('click', () => {
                const view = link.dataset.view;
                this.switchView(view);
            });
        });

        // Хайлт
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Burger menu (mobile)
        document.getElementById('burgerBtn')?.addEventListener('click', () => {
            document.getElementById('sidebar')?.classList.toggle('is-open');
        });
    }

    /**
     * Real-time subscription тохируулах
     */
    setupRealtimeSubscription() {
        // Жишээ: 'tasks' хүснэгтийн өөрчлөлтийг сонсох
        const channel = supabase.channel('public:tasks')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'tasks' },
                (payload) => {
                    console.log('Realtime update:', payload);
                    // Өөрчлөлтийг UI-д тусгах
                    this.handleRealtimeUpdate(payload);
                }
            )
            .subscribe((status) => {
                console.log('Realtime subscription status:', status);
            });
    }

    /**
     * Realtime өөрчлөлтийг боловсруулах
     */
    handleRealtimeUpdate(payload) {
        // Даалгаврын жагсаалтыг шинэчлэх
        if (payload.table === 'tasks') {
            this.loadTasks();
        }
    }

    /**
     * View солих
     */
    switchView(viewId) {
        this.currentView = viewId;
        
        // Бүх view-г нуух
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('is-active');
        });

        // Сонгосон view-г харуулах
        const target = document.querySelector(`.view[data-view="${viewId}"]`);
        if (target) target.classList.add('is-active');

        // Navlink-ийг идэвхжүүлэх
        document.querySelectorAll('.navlink[data-view]').forEach(link => {
            link.classList.remove('is-active');
            if (link.dataset.view === viewId) {
                link.classList.add('is-active');
            }
        });

        // Хажуу цэсийг хаах (mobile)
        document.getElementById('sidebar')?.classList.remove('is-open');
    }

    /**
     * Хайлтыг боловсруулах
     */
    handleSearch(query) {
        const dropdown = document.getElementById('searchResultsDropdown');
        const clearBtn = document.getElementById('clearSearchBtn');
        
        if (!dropdown) return;
        
        if (query.length < 2) {
            dropdown.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'none';
            return;
        }

        if (clearBtn) clearBtn.style.display = 'block';
        
        // Supabase-ээс хайх
        this.searchData(query);
    }

    /**
     * Supabase-ээс өгөгдөл хайх
     */
    async searchData(query) {
        const dropdown = document.getElementById('searchResultsDropdown');
        if (!dropdown) return;

        try {
            // Номын сангаас хайх
            const { data: books, error } = await supabase
                .from('books')
                .select('id, title, type')
                .ilike('title', `%${query}%`)
                .limit(5);

            if (error) throw error;

            // Үр дүнг харуулах
            if (!books || books.length === 0) {
                dropdown.innerHTML = '<div class="search-item" style="color:var(--ink-500);">Илэрц олдсонгүй</div>';
            } else {
                dropdown.innerHTML = books.map(book => `
                    <div class="search-item" data-id="${book.id}">
                        <i class="fas fa-${book.type === 'video' ? 'video' : 'book'}" style="color:var(--ink-300);"></i>
                        <div class="search-item__info">
                            <span class="search-item__title">${book.title}</span>
                            <span class="search-item__type">${book.type || 'Ном'}</span>
                        </div>
                    </div>
                `).join('');
            }

            dropdown.style.display = 'block';
        } catch (error) {
            console.error('Search error:', error);
            dropdown.innerHTML = '<div class="search-item" style="color:#ef4444;">Хайлтад алдаа гарлаа</div>';
            dropdown.style.display = 'block';
        }
    }

    /**
     * Гарах үйлдэл
     */
    async handleLogout() {
        try {
            const { error } = await Auth.signOut();
            if (error) throw new Error(error);
            this.showToast('👋 Амжилттай гарлаа');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 500);
        } catch (error) {
            console.error('Logout error:', error);
            this.showToast('❌ Гарахад алдаа гарлаа', 'error');
        }
    }

    /**
     * Профайл шинэчлэх
     */
    async handleProfileUpdate(e) {
        const form = e.target;
        const formData = new FormData(form);
        
        const updates = {
            full_name: formData.get('name') || '',
            age: parseInt(formData.get('age')) || null,
            gender: formData.get('gender') || '',
            phone: formData.get('phone') || '',
        };

        try {
            // Аватар зураг байвал upload хийх
            const avatarFile = document.getElementById('profileImageInput')?.files[0];
            if (avatarFile) {
                const avatarUrl = await this.uploadAvatar(avatarFile);
                if (avatarUrl) updates.avatar_url = avatarUrl;
            }

            const { user, error } = await Auth.updateProfile(updates);
            if (error) throw new Error(error);

            this.currentUser = user;
            this.updateUIForUser();
            this.showToast('✅ Профайл амжилттай хадгалагдлаа');
        } catch (error) {
            console.error('Profile update error:', error);
            this.showToast('❌ Профайл хадгалахад алдаа гарлаа', 'error');
        }
    }

    /**
     * Аватар зураг upload хийх
     */
    async uploadAvatar(file) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${this.currentUser.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Avatar upload error:', error);
            return null;
        }
    }

    /**
     * Даалгавруудыг ачаалах
     */
    async loadTasks() {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Load tasks error:', error);
            return [];
        }
    }

    /**
     * Toast мэдэгдэл харуулах
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = 'toast show';
        
        if (type === 'error') {
            toast.style.background = '#dc2626';
        } else {
            toast.style.background = 'var(--forest-900)';
        }

        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.style.background = 'var(--forest-900)';
            }, 300);
        }, 3000);
    }
}

// ============================================================
// Програмыг эхлүүлэх
// ============================================================
const app = new App();

// DOM бүрэн ачаалагдсаны дараа эхлүүлэх
document.addEventListener('DOMContentLoaded', async () => {
    await app.init();
    window.app = app; // Debugging зорилгоор
});

// Export
export default App;