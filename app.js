// PEGÁ ACÁ TUS DATOS DE SUPABASE
const SUPABASE_URL = "TU_SUPABASE_URL";
const SUPABASE_KEY = "TU_ANON_KEY";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
  if (!canvas) return;
  const texto = document.getElementById('texto').value || "B4W";
  const estilo = document.getElementById('estilo').value;
  const color1 = document.getElementById('color1').value;
  const color2 = document.getElementById('color2').value;
  const fondo = document.getElementById('fondo').value;

  // Fondo
  if (fondo === 'ladrillo') ctx.fillStyle = '#7a3b2e';
  if (fondo === 'hormigon') ctx.fillStyle = '#555';
  if (fondo === 'negro') ctx.fillStyle = '#000';
  if (fondo === 'chapa') ctx.fillStyle = '#2b4a6f';
  ctx.fillRect(0,0,1080,1080);

  // Líneas de ladrillo simuladas
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  for(let y=0; y<1080; y+=90){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(1080,y); ctx.stroke(); }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (estilo === 'neon') {
    ctx.font = '120px Monoton';
    ctx.shadowColor = color1; ctx.shadowBlur = 40;
    ctx.fillStyle = color1;
    ctx.fillText(texto.toUpperCase(), 540, 540);
    ctx.shadowBlur = 0;
  } else if (estilo === 'tag') {
    ctx.font = '160px Permanent Marker';
    ctx.fillStyle = color1;
    ctx.save(); ctx.translate(540,540); ctx.rotate(-0.08);
    ctx.fillText(texto, 0, 0); ctx.restore();
  } else if (estilo === 'bubble') {
    ctx.font = '150px Titan One';
    ctx.lineWidth = 18; ctx.strokeStyle = color2; ctx.lineJoin = 'round';
    ctx.strokeText(texto.toUpperCase(), 540, 540);
    ctx.fillStyle = color1; ctx.fillText(texto.toUpperCase(), 540, 540);
  } else {
    // stencil + wildstyle
    ctx.font = '140px Black Ops One';
    ctx.lineWidth = 8; ctx.strokeStyle = '#000';
    ctx.strokeText(texto.toUpperCase(), 540, 540);
    ctx.fillStyle = color1; ctx.fillText(texto.toUpperCase(), 540, 540);
    if (estilo === 'wildstyle') {
      ctx.font = '60px Black Ops One'; ctx.fillStyle = color2;
      ctx.fillText('★ B4W ★', 540, 700);
    }
  }
  ctx.font = '30px Arial'; ctx.fillStyle = '#fff';
  ctx.fillText('[B4W] WALL', 540, 1000);
}

// Preview en vivo
['texto','estilo','color1','color2','fondo'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', dibujar);
});
if (canvas) dibujar();

// Cargar muro
async function cargarMuro(filtro='todos') {
  const muro = document.getElementById('muro');
  if (!muro) return;
  let q = supabase.from('graffitis').select('*').order('created_at', {ascending:false}).limit(50);
  if (filtro !== 'todos') q = q.eq('estilo', filtro);
  const { data } = await q;
  muro.innerHTML = (data||[]).map(g => `
    <div class="card">
      <div style="padding:20px; text-align:center; background:#222; font-family:'${FUENTES[g.estilo]}', sans-serif; font-size:32px; color:${g.color1}">${g.texto}</div>
      <div class="card-info">
  <b>${g.autor_alias}</b> • ${g.estilo}<br>
  <a href="graffiti.html?id=${g.id}" style="color:#ff2d55; font-weight:bold">Ver / Compartir →</a>
</div>
      <br><a href="https://wa.me/?text=${encodeURIComponent('Mirá mi graffiti en B4W WALL: ' + location.origin)}" target="_blank">Compartir en WhatsApp</a></div>
    </div>`).join('') || '<p>Todavía no hay graffitis. ¡Sé el primero!</p>';
}
function filtrar(e){ cargarMuro(e); }
if (document.getElementById('muro')) cargarMuro();

// Publicar
document.getElementById('btnPintar')?.addEventListener('click', async () => {
  const texto = document.getElementById('texto').value;
  const { data, error } = await supabase.from('graffitis').insert([{
    texto, estilo: document.getElementById('estilo').value,
    color1: document.getElementById('color1').value,
    color2: document.getElementById('color2').value,
    fondo: document.getElementById('fondo').value,
    autor_alias: document.getElementById('alias').value || 'Anónimo'
  }]).select().single();
  if (error) return alert('Error: ' + error.message);
  //alert('¡Pintado! Ya está en la pared.');
  // Reemplazá el alert('¡Pintado!...') por esto:
window.location.href = `graffiti.html?id=${data.id}`;
  const url = location.origin + '/';
  document.getElementById('compartir').style.display = 'block';
  document.getElementById('linkWhatsapp').href = `https://wa.me/?text=${encodeURIComponent('Mirá mi graffiti: ' + texto + ' en B4W WALL ' + url)}`;
  document.getElementById('linkX').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Mi graffiti en B4W WALL: ' + texto)}&url=${encodeURIComponent(url)}`;
  document.getElementById('linkFacebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
});

// Descargar 9:16
document.getElementById('btnDescargar')?.addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = 'mi-graffiti-b4w.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
});