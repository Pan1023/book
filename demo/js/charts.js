/* ==========================================================================
   轻量 SVG 图表（无第三方依赖）：环形图 / 折线图 / 柱状图
   ========================================================================== */

const Charts = {

  /* ---------- 环形图 ----------
     segments: [{ value, color, label }] */
  donut(segments, opts = {}) {
    const size = opts.size || 180;
    const stroke = opts.stroke || 22;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    let offset = 0;

    const arcs = segments.map(seg => {
      const frac = seg.value / total;
      const len = frac * c;
      const el = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none"
        stroke="${seg.color}" stroke-width="${stroke}"
        stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}"
        transform="rotate(-90 ${size / 2} ${size / 2})" stroke-linecap="butt"/>`;
      offset += len;
      return el;
    }).join('');

    const center = opts.center
      ? `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
           <div style="font-size:26px;font-weight:700">${opts.center.value}</div>
           <div style="font-size:12px;color:var(--text-3)">${opts.center.label}</div>
         </div>`
      : '';

    return `<div style="position:relative;width:${size}px;height:${size}px;margin:0 auto">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${arcs}</svg>
      ${center}
    </div>`;
  },

  donutLegend(segments, total) {
    return `<div class="chart-legend" style="justify-content:center">
      ${segments.map(s => `
        <div class="chart-legend__item">
          <span class="chart-legend__dot" style="background:${s.color}"></span>
          ${s.label} <b style="margin-left:2px">${s.value}</b>
          <span style="color:var(--text-3)">(${UI.pct(s.value, total)}%)</span>
        </div>`).join('')}
    </div>`;
  },

  /* ---------- 折线图（多序列） ----------
     data: [{ date, s1, s2, ... }], series: [{ key, name, color }] */
  line(data, series, opts = {}) {
    const w = opts.width || 640;
    const h = opts.height || 240;
    const pad = { l: 38, r: 14, t: 16, b: 28 };
    const iw = w - pad.l - pad.r;
    const ih = h - pad.t - pad.b;
    const max = Math.max(...data.map(d => Math.max(...series.map(s => d[s.key])))) * 1.15 || 10;
    const x = i => pad.l + (i / (data.length - 1)) * iw;
    const y = v => pad.t + ih - (v / max) * ih;

    // 网格线
    const gridLines = [0, .25, .5, .75, 1].map(f => {
      const yy = pad.t + ih * (1 - f);
      const val = Math.round(max * f);
      return `<line x1="${pad.l}" y1="${yy}" x2="${w - pad.r}" y2="${yy}" stroke="#eef0f4" stroke-width="1"/>
              <text x="${pad.l - 8}" y="${yy + 4}" text-anchor="end" font-size="10" fill="#9ca3af">${val}</text>`;
    }).join('');

    // X 轴标签（抽稀）
    const xLabels = data.map((d, i) => {
      if (data.length > 8 && i % 2 === 1) return '';
      return `<text x="${x(i)}" y="${h - 8}" text-anchor="middle" font-size="10" fill="#9ca3af">${d.date}</text>`;
    }).join('');

    // 序列
    const paths = series.map(s => {
      const pts = data.map((d, i) => `${x(i)},${y(d[s.key])}`);
      const linePath = 'M' + pts.join(' L');
      const areaPath = `M${x(0)},${pad.t + ih} L` + pts.map(p => p).join(' L') + ` L${x(data.length - 1)},${pad.t + ih} Z`;
      const dots = data.map((d, i) =>
        `<circle cx="${x(i)}" cy="${y(d[s.key])}" r="3" fill="#fff" stroke="${s.color}" stroke-width="2">
           <title>${d.date} ${s.name}：${d[s.key]}</title>
         </circle>`).join('');
      return `<path d="${areaPath}" fill="${s.color}" opacity="0.07"/>
              <path d="${linePath}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round"/>
              ${dots}`;
    }).join('');

    return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block">${gridLines}${xLabels}${paths}</svg>`;
  },

  legend(series) {
    return `<div class="chart-legend">
      ${series.map(s => `<div class="chart-legend__item">
        <span class="chart-legend__dot" style="background:${s.color}"></span>${s.name}
      </div>`).join('')}
    </div>`;
  },

  /* ---------- 柱状图（横向对比条用 HTML，纵向柱用 SVG） ----------
     data: [{ label, value, color? }] */
  bars(data, opts = {}) {
    const w = opts.width || 640;
    const h = opts.height || 230;
    const pad = { l: 10, r: 10, t: 20, b: 34 };
    const iw = w - pad.l - pad.r;
    const ih = h - pad.t - pad.b;
    const max = Math.max(...data.map(d => d.value)) * 1.15 || 10;
    const band = iw / data.length;
    const bw = Math.min(38, band * 0.55);

    const bars = data.map((d, i) => {
      const cx = pad.l + band * i + band / 2;
      const bh = (d.value / max) * ih;
      const by = pad.t + ih - bh;
      const color = d.color || '#6366f1';
      return `<rect x="${cx - bw / 2}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="${color}">
                <title>${d.label}：${d.value}</title>
              </rect>
              <text x="${cx}" y="${by - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="#4b5563">${d.display != null ? d.display : d.value}</text>
              <text x="${cx}" y="${h - 12}" text-anchor="middle" font-size="10" fill="#9ca3af">${d.label}</text>`;
    }).join('');

    return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block">
      <line x1="${pad.l}" y1="${pad.t + ih}" x2="${w - pad.r}" y2="${pad.t + ih}" stroke="#e5e7eb"/>
      ${bars}
    </svg>`;
  }
};
