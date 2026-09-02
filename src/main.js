import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="/" aria-label="Signal home"><span class="brand-mark">↗</span> signal<span class="brand-dot">.</span></a>
    <div class="header-meta"><span class="status-dot"></span><span id="connection-label">Connected</span><span class="divider"></span><span>Browser test</span></div>
  </header>
  <main>
    <section class="intro">
      <div><p class="eyebrow">CONTINUOUS DOWNLOAD TEST</p><h1>Find your router's<br><em>sweet spot.</em></h1></div>
      <p class="intro-copy">Keep this tab open while you walk around. A steady line means a strong position; dips reveal where your signal starts to fade.</p>
    </section>
    <section class="dashboard-grid">
      <div class="chart-panel panel">
        <div class="panel-head"><div><p class="eyebrow">LIVE THROUGHPUT</p><div class="live-value"><span id="speed-value">0.0</span><small> Mbps</small></div></div><div class="running"><span class="pulse"></span><span id="run-label">Ready to measure</span></div></div>
        <div class="chart-wrap"><canvas id="speed-chart" aria-label="Live download speed chart"></canvas><div class="chart-y-label top">600 Mbps</div><div class="chart-y-label bottom">0 Mbps</div><div class="chart-x-label start">now</div><div class="chart-x-label end">60 sec</div></div>
        <div class="chart-foot"><span><i class="legend-line"></i>Download speed</span><span id="sample-count">0 samples</span><span id="proof-value">Network proof: waiting</span></div>
      </div>
      <aside class="side-column">
        <div class="metric-row panel"><div><p class="eyebrow">CURRENT</p><strong id="current-value">0.0</strong><span> Mbps</span></div><span class="metric-icon">↗</span></div>
        <div class="metric-row panel"><div><p class="eyebrow">PEAK SPEED</p><strong id="peak-value">—</strong><span id="peak-unit"> Mbps</span></div><span class="metric-icon peak">↟</span></div>
        <div class="metric-row panel"><div><p class="eyebrow">AVERAGE</p><strong id="average-value">—</strong><span> Mbps</span></div><span class="metric-icon avg">≈</span></div>
        <div class="note-panel"><div class="note-top"><span class="note-icon">⌖</span><p class="eyebrow">POSITION GUIDE</p></div><h2 id="guide-title">Ready when you are.</h2><p id="guide-copy">Start the test, then move with your device. We will call out the strongest sustained signal.</p><button id="spot-button" type="button" disabled>Mark this spot <span>+</span></button></div>
      </aside>
    </section>
    <section class="controls"><button class="primary-button" id="start-button" type="button"><span class="play-icon">▶</span><span id="button-label">Start continuous test</span></button><button class="icon-button" id="reset-button" type="button" aria-label="Reset test" title="Reset test">↺</button><div class="session-time"><span class="eyebrow">SESSION</span><strong id="timer">00:00</strong></div><p class="tip"><span>i</span> For a fair comparison, pause between spots and let each reading settle for 30 seconds.</p></section>
    <section class="footer-note"><span>Signal is measured from your current connection</span><span id="last-updated">Awaiting first sample</span></section>
  </main>
`

const chart = document.querySelector('#speed-chart')
const context = chart.getContext('2d')
const points = []
let timerId = null
let seconds = 0
let bestSpot = 0
let active = false

function formatTime(value) { return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}` }
function resizeCanvas() { const ratio = window.devicePixelRatio || 1; chart.width = chart.clientWidth * ratio; chart.height = chart.clientHeight * ratio; context.setTransform(ratio, 0, 0, ratio, 0, 0); drawChart() }
function drawChart() {
  const width = chart.clientWidth; const height = chart.clientHeight; context.clearRect(0, 0, width, height)
  context.strokeStyle = 'rgba(231, 237, 224, .11)'; context.lineWidth = 1
  for (let index = 1; index < 5; index += 1) { const y = (height / 5) * index; context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke() }
  if (!points.length) return
  const max = 600; const step = width / Math.max(points.length - 1, 59)
  const line = points.map((point, index) => [index * step, height - (Math.min(point, max) / max) * height])
  context.beginPath(); line.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y)); context.lineTo(line.at(-1)[0], height); context.lineTo(0, height); context.closePath(); context.fillStyle = 'rgba(185, 239, 91, .13)'; context.fill()
  context.beginPath(); line.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y)); context.strokeStyle = '#b9ef5b'; context.lineWidth = 2.5; context.stroke()
  const last = line.at(-1); context.beginPath(); context.arc(last[0], last[1], 4, 0, Math.PI * 2); context.fillStyle = '#b9ef5b'; context.fill(); context.strokeStyle = '#101210'; context.lineWidth = 3; context.stroke()
}
function updateGuide(value) { const title = document.querySelector('#guide-title'); const copy = document.querySelector('#guide-copy'); if (value > bestSpot + 4) { title.textContent = 'This spot is promising.'; copy.textContent = 'You have a new high. Keep walking slowly and mark the best sustained reading.' } else if (value < bestSpot - 14) { title.textContent = 'Signal is falling here.'; copy.textContent = 'This position is weaker than your best reading. Try a higher, more open location.' } }
async function measureDownload() { const requestedBytes = 5000000; const started = performance.now(); const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${requestedBytes}&cacheBust=${Date.now()}`, { cache: 'no-store' }); if (!response.ok) throw new Error(`Download failed (${response.status})`); const data = await response.arrayBuffer(); const elapsed = (performance.now() - started) / 1000; return { speed: (data.byteLength * 8) / elapsed / 1000000, bytes: data.byteLength, elapsed } }
async function sample() { try { const result = await measureDownload(); const value = result.speed; seconds += 1; points.push(value); if (points.length > 60) points.shift(); const peak = Math.max(...points); const average = points.reduce((total, point) => total + point, 0) / points.length; document.querySelector('#speed-value').textContent = value.toFixed(1); document.querySelector('#current-value').textContent = value.toFixed(1); document.querySelector('#peak-value').textContent = peak.toFixed(1); document.querySelector('#average-value').textContent = average.toFixed(1); document.querySelector('#sample-count').textContent = `${points.length} samples`; document.querySelector('#proof-value').textContent = `Real data: ${(result.bytes / 1000000).toFixed(2)} MB / ${result.elapsed.toFixed(2)} s = ${value.toFixed(1)} Mbps`; document.querySelector('#timer').textContent = formatTime(seconds); document.querySelector('#last-updated').textContent = `HTTP GET: speed.cloudflare.com`; updateGuide(value); drawChart() } catch (error) { active = false; document.querySelector('#run-label').textContent = 'Unable to reach test server'; document.querySelector('#connection-label').textContent = 'Connection error'; document.querySelector('#button-label').textContent = 'Try again'; document.querySelector('.play-icon').textContent = '▶'; document.querySelector('#spot-button').disabled = !points.length } }
async function runSamples() { while (active) { await sample(); if (active) await new Promise((resolve) => setTimeout(resolve, 250)) } }
function toggleTest() { active = !active; const button = document.querySelector('#start-button'); document.querySelector('#button-label').textContent = active ? 'Pause continuous test' : 'Resume continuous test'; document.querySelector('#run-label').textContent = active ? 'Measuring continuously' : 'Test paused'; document.querySelector('#connection-label').textContent = active ? 'Connected / testing' : 'Connected'; document.querySelector('#spot-button').disabled = !points.length || active; document.querySelector('.play-icon').textContent = active ? 'Ⅱ' : '▶'; if (active) runSamples() }
document.querySelector('#start-button').addEventListener('click', toggleTest)
document.querySelector('#reset-button').addEventListener('click', () => { active = false; clearInterval(timerId); seconds = 0; points.length = 0; bestSpot = 0; document.querySelector('#button-label').textContent = 'Start continuous test'; document.querySelector('#run-label').textContent = 'Ready to measure'; document.querySelector('#connection-label').textContent = 'Connected'; document.querySelector('#spot-button').disabled = true; document.querySelector('#timer').textContent = '00:00'; document.querySelector('#speed-value').textContent = '0.0'; document.querySelector('#current-value').textContent = '0.0'; document.querySelector('#peak-value').textContent = '—'; document.querySelector('#average-value').textContent = '—'; document.querySelector('#sample-count').textContent = '0 samples'; document.querySelector('#guide-title').textContent = 'Ready when you are.'; document.querySelector('#guide-copy').textContent = 'Start the test, then move with your device. We will call out the strongest sustained signal.'; drawChart() })
document.querySelector('#spot-button').addEventListener('click', () => { bestSpot = Math.max(...points); document.querySelector('#spot-button').innerHTML = 'Spot saved <span>✓</span>'; document.querySelector('#guide-title').textContent = 'Best spot so far.'; document.querySelector('#guide-copy').textContent = `Saved at ${bestSpot.toFixed(1)} Mbps. Pause, move, and compare your next position.` })
window.addEventListener('resize', resizeCanvas); resizeCanvas()
