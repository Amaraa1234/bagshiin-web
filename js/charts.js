/**
 * js/charts.js
 * SmartClass — small dependency-free chart module (plain inline SVG,
 * no chart library). Currently draws the "Долоо хоногийн идэвх" bar
 * chart on the dashboard. Load order: after js/data.js, before
 * js/dashboard.js (dashboard.js calls Charts.renderBarChart()).
 */

const Charts = {

  /**
   * Renders a simple bar chart into the element with id `containerId`.
   * @param {string} containerId - target element id
   * @param {{day:string, value:number}[]} data - value is 0-100
   * @param {string} [tone] - "forest" | "ocean" | "sun", matches app palette
   */
  renderBarChart(containerId, data, tone = "ocean") {
    const el = document.getElementById(containerId);
    if (!el || !Array.isArray(data) || data.length === 0) return;

    const barColor = `var(--${tone}-500)`;
    const trackColor = "var(--line-soft)";
    const width = 100 / data.length;

    const bars = data.map((d) => {
      const value = Math.max(0, Math.min(100, Number(d.value) || 0));
      return `
        <div class="bar-chart__col" style="width:${width}%">
          <div class="bar-chart__track" style="background:${trackColor}">
            <div class="bar-chart__fill" style="height:${value}%; background:${barColor}"></div>
          </div>
          <span class="bar-chart__value">${value}</span>
          <span class="bar-chart__day">${d.day}</span>
        </div>`;
    }).join("");

    el.innerHTML = `<div class="bar-chart" role="img" aria-label="Долоо хоногийн идэвхийн график">${bars}</div>`;
  },
};