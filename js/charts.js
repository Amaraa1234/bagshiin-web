/**
 * ============================================================================
 *  js/charts.js — SmartClass жижиг график модуль
 * ============================================================================
 *  Гадны сан (Chart.js гэх мэт) ашиглахгүйгээр, цэвэр SVG-ээр bar chart
 *  зурна. Одоогоор dashboard.js-ийн "Долоо хоногийн идэвх" панелийг
 *  зурахад ашиглагдана. Ачаалах дараалал: js/app.js-ийн дараа,
 *  js/dashboard.js-ээс ӨМНӨ (dashboard.js Charts.renderBarChart()-г дуудна).
 * ============================================================================
 */

const Charts = {

  /**
   * @param {string} containerId - зураг байрлах элементийн id
   * @param {{day:string, value:number}[]} data - value 0-100 хооронд
   * @param {string} [tone] - "forest" | "ocean" | "sun" — app.js-ийн TONE-той таарна
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
