// ============================================================
// js/dashboard.js - Хяналтын самбарын статистик, график
// ============================================================
import { supabase } from './supabase.js';

function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

/**
 * Dashboard класс - хяналтын самбарын өгөгдөл, график
 */
export class Dashboard {
    constructor() {
        this.charts = {};
        this.stats = {};
    }

    async init() {
        await Promise.all([
            this.loadStats(),
            this.loadActivities()
        ]);
        this.setupCharts();
    }

    /**
     * Статистик өгөгдлийг ачаалах
     * ⚠️ Схемд 'users' болон 'courses' table байхгүй тул
     * тэдгээрийг 'profiles' болон 'enrollments'-оор орлуулсан.
     */
    async loadStats() {
        try {
            // Нийт сурагчид (profiles.role='student')
            // ⚠️ profiles table-ийн SELECT policy бүх нэвтэрсэн
            // хэрэглэгчид зөвшөөрөгдсөн байх ёстой (migration.sql-г үзнэ үү)
            const { count: students, error: sErr } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'student');
            if (sErr) throw sErr;

            // Идэвхтэй элсэлт (courses table байхгүй тул ойролцоо тоо)
            const { count: courses, error: cErr } = await supabase
                .from('enrollments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');
            if (cErr) throw cErr;

            // Хийгдэж буй/хийх ёстой даалгавар
            const { count: pending, error: pErr } = await supabase
                .from('assignments')
                .select('*', { count: 'exact', head: true })
                .in('status', ['todo', 'progress']);
            if (pErr) throw pErr;

            // Дууссан даалгавар
            const { count: completed, error: coErr } = await supabase
                .from('assignments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'done');
            if (coErr) throw coErr;

            this.updateStats({
                students: students || 0,
                courses: courses || 0,
                pending: pending || 0,
                completed: completed || 0
            });
        } catch (error) {
            console.error('Load stats error:', error.message || error);
        }
    }

    updateStats(stats) {
        const map = {
            statStudents: stats.students,
            statCourses: stats.courses,
            statPending: stats.pending,
            statCompleted: stats.completed
        };
        Object.keys(map).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = map[id];
        });
    }

    async loadActivities() {
        try {
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            if (error) throw error;
            this.renderActivities(data || []);
        } catch (error) {
            console.error('Load activities error:', error.message || error);
        }
    }

    renderActivities(activities) {
        const container = document.querySelector('.activity-feed');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = '<li style="color:var(--ink-500, #647279);">Үйлдэл байхгүй байна</li>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <li>
                <span class="activity-feed__icon">
                    <i class="fas fa-${this.getActivityIcon(activity.action_type)}"></i>
                </span>
                <div class="activity-feed__body">
                    <strong>${escapeHtml(activity.title)}</strong>
                    <p>${escapeHtml(activity.description || '')}</p>
                </div>
                <span class="activity-feed__time">${this.formatTime(activity.created_at)}</span>
            </li>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'user_add': 'user-plus',
            'submit': 'file-alt',
            'grade': 'check-circle',
            'comment': 'comment',
            'upload': 'upload',
            'default': 'circle'
        };
        return icons[type] || icons.default;
    }

    formatTime(timestamp) {
        if (!timestamp) return '';
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now - time) / 1000);

        if (diff < 60) return 'Сая';
        if (diff < 3600) return `${Math.floor(diff / 60)} мин`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} цаг`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} өдөр`;
        return time.toLocaleDateString('mn-MN');
    }

    setupCharts() {
        this.setupBarChart();
        this.setupDoughnutChart();
    }

    /**
     * ⚠️ Схемд 'monthly_activity' биш 'monthly_stats' гэж байгаа,
     * мөн багана нь 'count' биш 'activity_count'.
     */
    async setupBarChart() {
        const canvas = document.getElementById('barChart');
        if (!canvas) return;

        try {
            const { data, error } = await supabase
                .from('monthly_stats')
                .select('month, activity_count')
                .order('year', { ascending: true });
            if (error) throw error;

            const chartData = data && data.length > 0
                ? data.map(d => ({ month: d.month, count: d.activity_count }))
                : [
                    { month: '1-р сар', count: 12 },
                    { month: '2-р сар', count: 19 },
                    { month: '3-р сар', count: 8 },
                    { month: '4-р сар', count: 15 },
                    { month: '5-р сар', count: 22 },
                    { month: '6-р сар', count: 18 }
                ];

            this.renderBarChart(canvas, chartData);
        } catch (error) {
            console.error('Bar chart error:', error.message || error);
        }
    }

    renderBarChart(canvas, data) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width || 400;
        const height = canvas.height || 160;
        const padding = 30;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        ctx.clearRect(0, 0, width, height);

        const maxValue = Math.max(...data.map(d => d.count), 1);
        const barWidth = chartWidth / data.length * 0.6;
        const gap = chartWidth / data.length;

        data.forEach((item, index) => {
            const x = padding + index * gap + (gap - barWidth) / 2;
            const barHeight = (item.count / maxValue) * chartHeight;
            const y = padding + chartHeight - barHeight;

            const gradient = ctx.createLinearGradient(x, y, x, padding + chartHeight);
            gradient.addColorStop(0, '#0f7a52');
            gradient.addColorStop(1, '#1ba372');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 4);
            ctx.fill();

            ctx.fillStyle = '#647279';
            ctx.font = '9px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.month, x + barWidth / 2, padding + chartHeight + 14);
        });
    }

    async setupDoughnutChart() {
        const canvas = document.getElementById('doughnutChart');
        if (!canvas) return;

        try {
            const { data, error } = await supabase
                .from('category_stats')
                .select('name, value');
            if (error) throw error;

            const chartData = data && data.length > 0 ? data : [
                { name: 'Математик', value: 30 },
                { name: 'Физик', value: 25 },
                { name: 'Англи', value: 20 },
                { name: 'Бусад', value: 25 }
            ];

            this.renderDoughnutChart(canvas, chartData);
        } catch (error) {
            console.error('Doughnut chart error:', error.message || error);
        }
    }

    renderDoughnutChart(canvas, data) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        const innerRadius = radius * 0.6;

        const colors = ['#0f7a52', '#2f8fd1', '#f5b90c', '#8b5cf6', '#ef4444'];
        const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

        let startAngle = -Math.PI / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();

            const midAngle = startAngle + sliceAngle / 2;
            const labelRadius = (radius + innerRadius) / 2;
            const labelX = centerX + Math.cos(midAngle) * labelRadius;
            const labelY = centerY + Math.sin(midAngle) * labelRadius;

            if (sliceAngle > 0.3) {
                ctx.fillStyle = '#fff';
                ctx.font = '10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${Math.round(item.value / total * 100)}%`, labelX, labelY);
            }

            startAngle = endAngle;
        });
    }
}

export default Dashboard;