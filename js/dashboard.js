// ============================================================
// js/dashboard.js - Хяналтын самбар (Кэш + Charts)
// ============================================================
import { supabase, cachedQuery, invalidateCache } from './supabase.js';
import Charts from './charts.js';

const CACHE_KEYS = {
  STATS: 'dashboard_stats',
  ACTIVITIES: 'dashboard_activities',
  BAR_DATA: 'dashboard_bar',
  DOUGHNUT_DATA: 'dashboard_doughnut'
};

export class Dashboard {
  constructor() {
    this.stats = { students: 0, courses: 0, pending: 0, completed: 0 };
    this.activities = [];
    this._isLoading = false;
  }

  async init() {
    if (this._isLoading) return;
    this._isLoading = true;
    try {
      await Promise.all([
        this.loadStats(),
        this.loadActivities(),
        this.loadBarChartData(),
        this.loadDoughnutData()
      ]);
      this.setupCharts();
    } catch (error) {
      console.error('Dashboard init error:', error);
    } finally {
      this._isLoading = false;
    }
  }

  async loadStats() {
    try {
      const data = await cachedQuery(CACHE_KEYS.STATS, async () => {
        const [students, enrollments, pending, completed] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
          supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('assignments').select('*', { count: 'exact', head: true }).in('status', ['todo', 'progress']),
          supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'done')
        ]);
        return {
          students: students.count || 0,
          courses: enrollments.count || 0,
          pending: pending.count || 0,
          completed: completed.count || 0
        };
      }, 30000);
      Object.assign(this.stats, data);
      this.updateStatsUI(data);
    } catch (error) {
      console.warn('Stats load failed:', error);
    }
  }

  updateStatsUI(stats) {
    const map = {
      statStudents: stats.students,
      statCourses: stats.courses,
      statPending: stats.pending,
      statCompleted: stats.completed
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = val; }
    });
  }

  async loadActivities() {
    try {
      const data = await cachedQuery(CACHE_KEYS.ACTIVITIES, async () => {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        if (error) throw error;
        return data || [];
      }, 60000);
      this.activities = data;
      this.renderActivities(data);
    } catch (error) {
      console.warn('Activities load failed:', error);
      this.renderActivities([]);
    }
  }

  renderActivities(activities) {
    const container = document.querySelector('.activity-feed');
    if (!container) return;
    if (!activities || activities.length === 0) {
      container.innerHTML = `<li style="color:#647279; padding:0.5rem;"><i class="fas fa-inbox"></i> Үйлдэл байхгүй</li>`;
      return;
    }
    container.innerHTML = activities.map(act => `
      <li>
        <span class="activity-feed__icon"><i class="fas fa-${this.getActivityIcon(act.action_type)}"></i></span>
        <div class="activity-feed__body">
          <strong>${this.escapeHtml(act.title)}</strong>
          <p>${this.escapeHtml(act.description || '')}</p>
        </div>
        <span class="activity-feed__time">${this.formatTime(act.created_at)}</span>
      </li>
    `).join('');
  }

  getActivityIcon(type) {
    const icons = { user_add: 'user-plus', submit: 'file-alt', grade: 'check-circle', comment: 'comment', upload: 'upload', default: 'circle' };
    return icons[type] || icons.default;
  }

  formatTime(timestamp) {
    if (!timestamp) return '';
    const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000);
    if (diff < 60) return 'Сая';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} цаг`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} өдөр`;
    return new Date(timestamp).toLocaleDateString('mn-MN');
  }

  escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async loadBarChartData() {
    try {
      const data = await cachedQuery(CACHE_KEYS.BAR_DATA, async () => {
        const { data, error } = await supabase
          .from('monthly_stats')
          .select('month, activity_count')
          .order('year', { ascending: true });
        if (error) throw error;
        return data && data.length > 0
          ? data.map(d => ({ label: d.month, value: d.activity_count }))
          : [{ label: '1-р сар', value: 12 }, { label: '2-р сар', value: 19 }, { label: '3-р сар', value: 8 }];
      }, 120000);
      this.barData = data;
    } catch (error) {
      console.warn('Bar data load failed:', error);
      this.barData = [{ label: '1-р сар', value: 12 }, { label: '2-р сар', value: 19 }, { label: '3-р сар', value: 8 }];
    }
  }

  async loadDoughnutData() {
    try {
      const data = await cachedQuery(CACHE_KEYS.DOUGHNUT_DATA, async () => {
        const { data, error } = await supabase.from('category_stats').select('name, value');
        if (error) throw error;
        return data && data.length > 0 ? data.map(d => ({ label: d.name, value: d.value })) : [];
      }, 120000);
      this.doughnutData = data.length > 0 ? data : [{ label: 'Математик', value: 30 }, { label: 'Физик', value: 25 }];
    } catch (error) {
      console.warn('Doughnut data load failed:', error);
      this.doughnutData = [{ label: 'Математик', value: 30 }, { label: 'Физик', value: 25 }];
    }
  }

  setupCharts() {
    const barCanvas = document.getElementById('barChart');
    if (barCanvas && this.barData) {
      Charts.drawBarChart('barChart', this.barData, { colorStart: '#0f7a52', colorEnd: '#1ba372', rounded: true });
    }
    const doughnutCanvas = document.getElementById('doughnutChart');
    if (doughnutCanvas && this.doughnutData) {
      Charts.drawDoughnutChart('doughnutChart', this.doughnutData, { innerRatio: 0.6, colors: ['#0f7a52', '#2f8fd1', '#f5b90c', '#8b5cf6'] });
    }
  }
}

export default Dashboard;