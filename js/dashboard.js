// ============================================================
// js/dashboard.js - Хяналтын самбарын функцууд
// ============================================================
import { supabase } from './supabase.js';
import Auth from './auth.js';

/**
 * Dashboard класс - хяналтын самбарын өгөгдөл, график
 */
export class Dashboard {
    constructor() {
        this.charts = {};
        this.stats = {};
    }

    /**
     * Самбарыг эхлүүлэх
     */
    async init() {
        await this.loadStats();
        await this.loadActivities();
        this.setupCharts();
    }

    /**
     * Статистик өгөгдлийг ачаалах
     */
    async loadStats() {
        try {
            // Нийт сурагчид
            const { count: students, error: sErr } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('user_metadata->role', 'student');

            if (sErr) throw sErr;

            // Нийт хичээл
            const { count: courses, error: cErr } = await supabase
                .from('courses')
                .select('*', { count: 'exact', head: true });

            if (cErr) throw cErr;

            // Шалгах даалгавар
            const { count: pending, error: pErr } = await supabase
                .from('assignments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            if (pErr) throw pErr;

            // Дууссан даалгавар
            const { count: completed, error: coErr } = await supabase
                .from('assignments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'completed');

            if (coErr) throw coErr;

            // UI-д харуулах
            this.updateStats({
                students: students || 0,
                courses: courses || 0,
                pending: pending || 0,
                completed: completed || 0
            });

        } catch (error) {
            console.error('Load stats error:', error);
        }
    }

    /**
     * Статистик тоог UI-д шинэчлэх
     */
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

    /**
     * Үйлдлийн түүхийг ачаалах
     */
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
            console.error('Load activities error:', error);
        }
    }

    /**
     * Үйлдлийн түүхийг харуулах
     */
    renderActivities(activities) {
        const container = document.querySelector('.activity-feed');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = '<li style="color:var(--ink-500);">Үйлдэл байхгүй байна</li>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <li>
                <span class="activity-feed__icon">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </span>
                <div class="activity-feed__body">
                    <strong>${activity.title}</strong>
                    <p>${activity.description || ''}</p>
                </div>
                <span class="activity-feed__time">${this.formatTime(activity.created_at)}</span>
            </li>
        `).join('');
    }

    /**
     * Үйлдлийн төрлөөр icon авах
     */
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

    /**
     * Цагийг форматлах
     */
    formatTime(timestamp) {
        if (!timestamp) return '';
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now - time) / 1000);

        if (diff < 60) return 'Сая';
        if (diff < 3600) return `${Math.floor(diff / 60)} мин`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} цаг`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} өдөр`;
        return time.toLocaleDateString();
    }

    /**
     * Графикуудыг тохируулах
     */
    setupCharts() {
        // Энд Chart.js эсвэл өөр library ашиглан график зурах боломжтой
        this.setupBarChart();
        this.setupDoughnutChart();
    }

    /**
     * Бар график
     */
    async setupBarChart() {
        const canvas = document.getElementById('barChart');
        if (!canvas) return;

        try {
            const { data, error } = await supabase
                .from('monthly_activity')
                .select('month, count')
                .order('month', { ascending: true });

            if (error) throw error;

            // Хэрэв өгөгдөл байхгүй бол жишээ өгөгдөл харуулах
            const chartData = data && data.length > 0 ? data : [
                { month: '1-р сар', count: 12 },
                { month: '2-р сар', count: 19 },
                { month: '3-р сар', count: 8 },
                { month: '4-р сар', count: 15 },
                { month: '5-р сар', count: 22 },
                { month: '6-р сар', count: 18 }
            ];

            this.renderBarChart(canvas, chartData);
        } catch (error) {
            console.error('Bar chart error:', error);
        }
    }

    /**
     * Бар график зурах
     */
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

            // Бар
            const gradient = ctx.createLinearGradient(x, y, x, padding + chartHeight);
            gradient.addColorStop(0, '#0f7a52');
            gradient.addColorStop(1, '#1ba372');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 4);
            ctx.fill();

            // Label
            ctx.fillStyle = '#647279';
            ctx.font = '9px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.month, x + barWidth / 2, padding + chartHeight + 14);
        });
    }

    /**
     * Doughnut график
     */
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
            console.error('Doughnut chart error:', error);
        }
    }

    /**
     * Doughnut график зурах
     */
    renderDoughnutChart(canvas, data) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        const innerRadius = radius * 0.6;

        const colors = ['#0f7a52', '#2f8fd1', '#f5b90c', '#8b5cf6', '#ef4444'];
        const total = data.reduce((sum, d) => sum + d.value, 0);

        let startAngle = -Math.PI / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;

            // Үндсэн хэсэг
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();

            // Label
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

// Export
export default Dashboard;