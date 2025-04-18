const SUPABASE_URL = 'https://wicqioozqcaosvrzjvgt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpY3Fpb296cWNhb3N2cnpqdmd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NTEzMTIsImV4cCI6MjA2MDUyNzMxMn0.CgIitZHfZNCieLIWK5b7rWlWXI9kzn2WRcgPiMDpsM4';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const listaUsuarios = document.getElementById('lista-usuarios');
const chatContainer = document.getElementById('chat-container');
const tituloChat = document.getElementById('titulo-chat');
const buscador = document.getElementById('buscador');

let todasLasConversaciones = [];

async function cargarUsuarios() {
  const { data, error } = await supabase
    .from('conversaciones')
    .select('conversacion_id, autor, mensaje, timestamp')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  // Agrupar por conversacion_id y obtener último mensaje
  const agrupadas = {};
  data.forEach(conv => {
    if (!agrupadas[conv.conversacion_id]) {
      agrupadas[conv.conversacion_id] = conv;
    }
  });

  todasLasConversaciones = Object.values(agrupadas);
  mostrarListaConversaciones(todasLasConversaciones);
}

function mostrarListaConversaciones(lista) {
  listaUsuarios.innerHTML = '';
  lista.forEach(conv => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${conv.conversacion_id.slice(0, 6)}</strong><br>${conv.mensaje.slice(0, 40)}...`;
    li.addEventListener('click', () => cargarMensajes(conv.conversacion_id));
    listaUsuarios.appendChild(li);
  });
}

async function cargarMensajes(conversacionId) {
  const { data, error } = await supabase
    .from('conversaciones')
    .select('*')
    .eq('conversacion_id', conversacionId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  tituloChat.innerText = `Conversación: ${conversacionId.slice(0, 6)}`;
  chatContainer.innerHTML = '';
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
    chatContainer.appendChild(div);
  });
}

buscador.addEventListener('input', () => {
  const filtro = buscador.value.toLowerCase();
  const filtradas = todasLasConversaciones.filter(c =>
    c.mensaje.toLowerCase().includes(filtro) ||
    c.conversacion_id.toLowerCase().includes(filtro)
  );
  mostrarListaConversaciones(filtradas);
});

cargarUsuarios();
