/**
 * ============================================================================
 *   js/charts.js — График болон визуализацийн модуль (ES Module)
 * ============================================================================
 */

export const Charts = {
  /**
   * Долоо хоногийн идэвхийг баганан (Bar) графикаар харуулна.
   * 
   * @param {string} containerId - Зураг байрлах DOM элементийн ID
   * @param {{day: string, value: number}[]} data - Хичээлийн идэвхийн өгөгдөл (value 0-100)
   * @param {string} [tone="ocean"] - "forest" | "ocean" | "sun" (app.js-ийн TONE токентой таарна)
   */
  renderBarChart(containerId, data, tone = "ocean") {
    const el = document.getElementById(containerId);
    if (!el || !Array.isArray(data) || data.length === 0) return;

    const barColor = `var(--${tone}-500)`;
    const trackColor = "var(--line-soft)";
    const width = 100 / data.length;

    const bars = data
      .map((d) => {
        const value = Math.max(0, Math.min(100, Number(d.value) || 0));
        return `
          <div class="bar-chart__col" style="width:${width}%">
            <div class="bar-chart__track" style="background:${trackColor}">
              <div class="bar-chart__fill" style="height:${value}%; background:${barColor}"></div>
            </div>
            <span class="bar-chart__value">${value}%</span>
            <span class="bar-chart__day">${d.day}</span>
          </div>`;
      })
      .join("");

    el.innerHTML = `<div class="bar-chart" role="img" aria-label="Долоо хоногийн идэвхийн график">${bars}</div>`;
  },
};

// Global scope-д холбож өгнө
window.Charts = Charts;