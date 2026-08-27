// ============================================================
// js/charts.js - График, диаграмын туслах функцууд
// ============================================================

/**
 * Chart класс - бүх төрлийн график зурах
 */
export class Charts {
    /**
     * Бар график зурах
     */
    static drawBarChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width = canvas.width || 400, height = canvas.height || 200 } = options;
        const padding = options.padding || 30;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        ctx.clearRect(0, 0, width, height);

        const maxValue = Math.max(...data.map(d => d.value), 1);
        const barWidth = chartWidth / data.length * 0.6;
        const gap = chartWidth / data.length;

        data.forEach((item, index) => {
            const x = padding + index * gap + (gap - barWidth) / 2;
            const barHeight = (item.value / maxValue) * chartHeight;
            const y = padding + chartHeight - barHeight;

            // Gradient
            const gradient = ctx.createLinearGradient(x, y, x, padding + chartHeight);
            gradient.addColorStop(0, options.colorStart || '#0f7a52');
            gradient.addColorStop(1, options.colorEnd || '#1ba372');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            if (options.rounded) {
                ctx.roundRect(x, y, barWidth, barHeight, 4);
            } else {
                ctx.rect(x, y, barWidth, barHeight);
            }
            ctx.fill();

            // Label
            ctx.fillStyle = options.labelColor || '#647279';
            ctx.font = options.labelFont || '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.label || '', x + barWidth / 2, padding + chartHeight + 16);
        });
    }

    /**
     * Doughnut график зурах
     */
    static drawDoughnutChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - (options.padding || 10);
        const innerRadius = radius * (options.innerRatio || 0.6);

        const colors = options.colors || ['#0f7a52', '#2f8fd1', '#f5b90c', '#8b5cf6', '#ef4444'];
        const total = data.reduce((sum, d) => sum + d.value, 0);

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

            // Legend
            if (options.showLabels && sliceAngle > 0.3) {
                const midAngle = startAngle + sliceAngle / 2;
                const labelRadius = (radius + innerRadius) / 2;
                const labelX = centerX + Math.cos(midAngle) * labelRadius;
                const labelY = centerY + Math.sin(midAngle) * labelRadius;

                ctx.fillStyle = '#fff';
                ctx.font = options.labelFont || '10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${Math.round(item.value / total * 100)}%`, labelX, labelY);
            }

            startAngle = endAngle;
        });

        // Center text
        if (options.centerText) {
            ctx.fillStyle = options.centerTextColor || '#17262b';
            ctx.font = options.centerFont || 'bold 14px Manrope, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(options.centerText, centerX, centerY);
        }
    }

    /**
     * Шугаман график зурах
     */
    static drawLineChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width = canvas.width || 400, height = canvas.height || 200 } = options;
        const padding = options.padding || 30;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        ctx.clearRect(0, 0, width, height);

        const maxValue = Math.max(...data.map(d => d.value), 1);
        const stepX = chartWidth / (data.length - 1);

        // Grid lines
        ctx.strokeStyle = '#edf1f0';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = padding + (i / 4) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Line
        ctx.beginPath();
        data.forEach((item, index) => {
            const x = padding + index * stepX;
            const y = padding + chartHeight - (item.value / maxValue) * chartHeight;
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = options.lineColor || '#0f7a52';
        ctx.lineWidth = options.lineWidth || 2.5;
        ctx.stroke();

        // Points
        data.forEach((item, index) => {
            const x = padding + index * stepX;
            const y = padding + chartHeight - (item.value / maxValue) * chartHeight;

            ctx.beginPath();
            ctx.arc(x, y, options.pointRadius || 4, 0, 2 * Math.PI);
            ctx.fillStyle = options.pointColor || '#0f7a52';
            ctx.fill();

            // Labels
            if (options.showLabels) {
                ctx.fillStyle = options.labelColor || '#647279';
                ctx.font = options.labelFont || '9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(item.label || '', x, padding + chartHeight + 14);
            }
        });
    }

    /**
     * Pie график зурах
     */
    static drawPieChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - (options.padding || 10);

        const colors = options.colors || ['#0f7a52', '#2f8fd1', '#f5b90c', '#8b5cf6', '#ef4444'];
        const total = data.reduce((sum, d) => sum + d.value, 0);

        let startAngle = 0;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();

            // Label
            if (options.showLabels && sliceAngle > 0.2) {
                const midAngle = startAngle + sliceAngle / 2;
                const labelRadius = radius * 0.65;
                const labelX = centerX + Math.cos(midAngle) * labelRadius;
                const labelY = centerY + Math.sin(midAngle) * labelRadius;

                ctx.fillStyle = '#fff';
                ctx.font = options.labelFont || '10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${Math.round(item.value / total * 100)}%`, labelX, labelY);
            }

            startAngle = endAngle;
        });
    }

    /**
     * Холимог график (бар + шугам)
     */
    static drawMixedChart(canvasId, datasets, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width = canvas.width || 500, height = canvas.height || 250 } = options;
        const padding = options.padding || 35;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        ctx.clearRect(0, 0, width, height);

        // Бүх өгөгдлийн максимумыг олох
        const allValues = datasets.flatMap(d => d.data.map(item => item.value));
        const maxValue = Math.max(...allValues, 1);

        datasets.forEach((dataset, datasetIndex) => {
            const isBar = dataset.type === 'bar';
            const data = dataset.data;
            const colors = dataset.colors || ['#0f7a52', '#2f8fd1'];
            const stepX = chartWidth / (data.length - 1);

            if (isBar) {
                // Бар график
                const barWidth = chartWidth / data.length * 0.5;
                data.forEach((item, index) => {
                    const x = padding + index * (chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2;
                    const barHeight = (item.value / maxValue) * chartHeight;
                    const y = padding + chartHeight - barHeight;

                    ctx.fillStyle = colors[index % colors.length];
                    ctx.beginPath();
                    ctx.roundRect(x, y, barWidth, barHeight, 4);
                    ctx.fill();
                });
            } else {
                // Шугаман график
                ctx.beginPath();
                data.forEach((item, index) => {
                    const x = padding + index * stepX;
                    const y = padding + chartHeight - (item.value / maxValue) * chartHeight;
                    if (index === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.strokeStyle = colors[0];
                ctx.lineWidth = dataset.lineWidth || 2.5;
                ctx.stroke();

                // Points
                data.forEach((item, index) => {
                    const x = padding + index * stepX;
                    const y = padding + chartHeight - (item.value / maxValue) * chartHeight;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, 2 * Math.PI);
                    ctx.fillStyle = colors[0];
                    ctx.fill();
                });
            }
        });

        // X тэнхлэгийн label
        if (options.labels) {
            ctx.fillStyle = '#647279';
            ctx.font = '9px Inter, sans-serif';
            ctx.textAlign = 'center';
            const stepX = chartWidth / (options.labels.length - 1);
            options.labels.forEach((label, index) => {
                const x = padding + index * stepX;
                ctx.fillText(label, x, padding + chartHeight + 16);
            });
        }
    }
}

// Chart.js roundRect polyfill (хэрэггүй бол)
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
        const r = typeof radii === 'number' ? radii : (radii || 0);
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        return this;
    };
}

export default Charts;