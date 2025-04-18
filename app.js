// ⚠️ Reemplaza con tus credenciales de Supabase
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_KEY = 'tu-api-key-publica';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function cargarConversaciones() {
  const { data, error } = await supabase
    .from('conversaciones')
    .select('*')
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error al cargar:', error);
    return;
  }

  const container = document.getElementById('chat-container');
  container.innerHTML = ''; // limpia antes de cargar

  data.forEach(msg => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(msg.autor === 'usuario' ? 'user' : 'bot');
    div.innerText = msg.mensaje;

    const hora = document.createElement('div');
    hora.classList.add('time');
    hora.innerText = new Date(msg.timestamp).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });

    div.appendChild(hora);
    container.appendChild(div);
  });
}

cargarConversaciones();
