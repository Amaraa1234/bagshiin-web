// ============================================================
// js/app.js - Үндсэн програмын контроллер (Кэштэй)
// ============================================================
import { supabase, cachedQuery, invalidateCache, cleanupSubscriptions } from './supabase.js';
import Auth from './auth.js';

class App {
  constructor() {
    this.currentUser = null;
    this.currentView = 'dashboard';
    this.initialized = false;
    this._toastTimer = null;
  }

  async init() {
    try {
      const session = await Auth.getSession();
      if (session) {
        this.currentUser = await Auth.getCurrentUser();
        this.updateUIForUser();
      }
      this.setupEventListeners();
      this.setupRealtimeSubscription();
      this.initialized = true;
      console.log('✅ App амжилттай эхэллээ');
      return true;
    } catch (error) {
      console.error('App init error:', error);
      return false;
    }
  }

  updateUIForUser() {
    if (!this.currentUser) return;
    const name = this.currentUser.user_metadata?.full_name || 
                 this.currentUser.email?.split('@')[0] || 'Хэрэглэгч';
    ['greetName', 'railUserName', 'topbarUserName'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = name;
    });
    const profileName = document.getElementById('profileName');
    if (profileName && !profileName.value) profileName.value = name;
    const profileEmail = document.getElementById('profileEmail');
    if (profileEmail && !profileEmail.value) profileEmail.value = this.currentUser.email || '';
    const avatar = document.getElementById('userAvatar');
    if (avatar) avatar.textContent = name.substring(0, 2).toUpperCase();
  }

  setupEventListeners() {
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await this.handleLogout();
    });
    document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleProfileUpdate(e);
    });
    document.querySelectorAll('.navlink[data-view]').forEach(link => {
      link.addEventListener('click', () => {
        this.switchView(link.dataset.view);
      });
    });
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }
    document.getElementById('burgerBtn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('is-open');
    });
  }

  setupRealtimeSubscription() {
    const channel = supabase.channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        console.log('Realtime update:', payload);
        this.handleRealtimeUpdate(payload);
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });
  }

  handleRealtimeUpdate(payload) {
    if (payload.table === 'tasks') {
      this.loadTasks();
    }
  }

  switchView(viewId) {
    this.currentView = viewId;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('is-active'));
    const target = document.querySelector(`.view[data-view="${viewId}"]`);
    if (target) target.classList.add('is-active');
    document.querySelectorAll('.navlink[data-view]').forEach(link => {
      link.classList.toggle('is-active', link.dataset.view === viewId);
    });
    document.getElementById('sidebar')?.classList.remove('is-open');
  }

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
    this.searchData(query);
  }

  async searchData(query) {
    const dropdown = document.getElementById('searchResultsDropdown');
    if (!dropdown) return;
    try {
      const { data: books, error } = await supabase
        .from('library')
        .select('id, title, subject')
        .ilike('title', `%${query}%`)
        .limit(5);
      if (error) throw error;
      if (!books || books.length === 0) {
        dropdown.innerHTML = '<div class="search-item" style="color:var(--ink-500);">Илэрц олдсонгүй</div>';
      } else {
        dropdown.innerHTML = books.map(book => `
          <div class="search-item" data-id="${book.id}">
            <i class="fas fa-book" style="color:var(--ink-300);"></i>
            <div class="search-item__info">
              <span class="search-item__title">${book.title}</span>
              <span class="search-item__type">${book.subject || 'Ном'}</span>
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

  async handleLogout() {
    try {
      const { error } = await Auth.signOut();
      if (error) throw new Error(error);
      this.showToast('👋 Амжилттай гарлаа');
      setTimeout(() => { window.location.href = '/index.html'; }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      this.showToast('❌ Гарахад алдаа гарлаа', 'error');
    }
  }

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

  async uploadAvatar(file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${this.currentUser.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return publicUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      return null;
    }
  }

  async loadTasks() {
    try {
      const data = await cachedQuery('tasks', async () => {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      }, 30000);
      return data;
    } catch (error) {
      console.error('Load tasks error:', error);
      return [];
    }
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast show';
    toast.style.background = type === 'error' ? '#dc2626' : 'var(--forest-900, #0b3d2e)';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

const app = new App();
document.addEventListener('DOMContentLoaded', async () => {
  await app.init();
  window.app = app;
});

export default App;