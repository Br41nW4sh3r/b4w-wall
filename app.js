// B4W WALL - app.js FIX
console.log("app.js cargado");

let supabase = null;
try {
  const SUPABASE_URL = "https://ciwjyflatveowadenini.supabase.co"; // <-- pegá acá tu URL real
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpd2p5ZmxhdHZlb3dhZGVuaW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MzE5ODAsImV4cCI6MjExMTEwNzk4MH0.wswRXCIhm5ZIMdtvncfssZO_y6wUigjgMmTMVYxA1ic"; // <-- pegá acá tu anon key real
  if (SUPABASE_URL.startsWith("http") && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase OK");
  } else {
    console.log("Supabase NO configurado todavía, sigo en modo solo-dibujo");
  }
} catch (e) {
  console.log("Error Supabase, sigo igual:", e);
  supabase = null;
}

const canvas = document.getElementById('canvas');
const ctx = canvas?.getContext('2d');

const FUENTES = {
  stencil: 'Black Ops One',
  bubble: 'Titan One',
  wildstyle: 'Black Ops One',
  neon: 'Monoton',
  tag: 'Permanent Marker'
};

function dibujar() {
  if (!canvas || !ctx) return;
  console.log("dibujando...");

  const textoEl = document.getElementById('texto');
  const estiloEl = document.getElementById('estilo');
  const color1El = document.getElementById('color1');
  const color2El = document.getElementById('color2');
  const fondoEl = document.getElementById('fondo');

  const texto = (textoEl?.value || "B4W").toUpperCase();
  const estilo = estiloEl?.value || "stencil";
  const color1 = color1El?.value || "#ff2d55";
  const color2 = color2El?.value || "#ffd60a";
  const fondo = fondoEl?.value || "ladrillo";

  // Fondo
  let bg = '#7a3b2e';
  if (fondo === 'hormigon') bg = '#555';
  if (fondo === 'negro') bg = '#000';
  if (fondo === 'chapa') bg = '#2b4a6f';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1080);

  // Lineas ladrillo
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (let y = 0; y < 1080; y += 90) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = 0;

  if (estilo === 'neon') {
    ctx.font = '110px Monoton, Arial';
    ctx.shadowColor = color1; ctx.shadowBlur = 40;
    ctx.fillStyle = color1;
    ctx.fillText(texto, 540, 540);
    ctx.shadowBlur = 0;
  } else if (estilo === 'tag') {
    ctx.font = '160px "Permanent Marker", Arial';
    ctx.fillStyle = color1;
    ctx.save(); ctx.translate(540, 540); ctx.rotate(-0.08);
    ctx.fillText(texto, 0, 0); ctx.restore();
  } else if (estilo === 'bubble') {
    ctx.font = '140px "Titan One", Arial';
    ctx.lineWidth = 20; ctx.strokeStyle = color2; ctx.lineJoin = 'round';
    ctx.strokeText(texto, 540, 540);
    ctx.fillStyle = color1; ctx.fillText(texto, 540, 540);
  } else {
    ctx.font = '130px "Black Ops One", Arial';
    ctx.lineWidth = 10; ctx.strokeStyle = '#000';
    ctx.strokeText(texto, 540, 540);
    ctx.fillStyle = color1; ctx.fillText(texto, 540, 540);
    if (estilo === 'wildstyle') {
      ctx.font = '60px "Black Ops One", Arial'; ctx.fillStyle = color2;
      ctx.fillText('★ B4W ★', 540, 720);
    }
  }

  ctx.font = 'bold 30px Arial'; ctx.fillStyle = '#fff';
  ctx.fillText('[B4W] WALL', 540, 1000);
}

// Escuchar cambios
['texto','estilo','color1','color2','fondo'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', dibujar);
});

// Dibujar apenas carga + cuando cargan las fuentes
if (canvas) {
  dibujar();
  document.fonts?.ready.then(() => dibujar());
  setTimeout(dibujar, 500);
}

// --- MURO ---
async function cargarMuro(filtro = 'todos') {
  const muro = document.getElementById('muro');
  if (!muro || !supabase) { if(muro) muro.innerHTML = '<p>Configurá Supabase para ver la pared. Mientras tanto podés crear tu graffiti.</p>'; return; }
  let q = supabase.from('graffitis').select('*').order('created_at', {ascending:false}).limit(50);
  if (filtro !== 'todos') q = q.eq('estilo', filtro);
  const { data, error } = await q;
  if (error) { muro.innerHTML = '<p>Error: ' + error.message + '</p>'; return; }
  muro.innerHTML = (data||[]).map(g => `
    <div class="card">
      <div style="padding:30px 10px; text-align:center; background:#222; font-family:'${FUENTES[g.estilo]||'Arial'}', sans-serif; font-size:32px; color:${g.color1}">${g.texto}</div>
      <div class="card-info"><b>${g.autor_alias}</b> • ${g.estilo}<br>
      <a href="graffiti.html?id=${g.id}" style="color:#ff2d55; font-weight:bold">Ver / Compartir →</a></div>
    </div>`).join('') || '<p>Todavía no hay graffitis. ¡Sé el primero!</p>';
}
function filtrar(e){ cargarMuro(e); }
if (document.getElementById('muro')) cargarMuro();

// --- PINTAR ---
document.getElementById('btnPintar')?.addEventListener('click', async () => {
  if (!supabase) return alert('Falta configurar Supabase: pegá tu URL y ANON KEY en app.js y en graffiti.html');
  const texto = document.getElementById('texto').value;
  const { data, error } = await supabase.from('graffitis').insert([{
    texto, estilo: document.getElementById('estilo').value,
    color1: document.getElementById('color1').value,
    color2: document.getElementById('color2').value,
    fondo: document.getElementById('fondo').value,
    autor_alias: document.getElementById('alias').value || 'Anónimo'
  }]).select().single();
  if (error) return alert('Error: ' + error.message);
  window.location.href = `graffiti.html?id=${data.id}`;
});

// --- DESCARGAR ---
document.getElementById('btnDescargar')?.addEventListener('click', () => {
  if (!canvas) return;
  const a = document.createElement('a');
  a.download = 'mi-graffiti-b4w.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
});