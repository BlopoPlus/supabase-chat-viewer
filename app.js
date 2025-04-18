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
    .from('n8n_personalagent_chat_histories')
    .select('session_id, message, id')
    .order('id', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  // Agrupar por session_id y tomar un mensaje como vista previa
  const agrupadas = {};
  data.forEach(row => {
    if (!agrupadas[row.session_id]) {
      agrupadas[row.session_id] = row;
    }
  });

  todasLasConversaciones = Object.values(agrupadas);
  mostrarListaConversaciones(todasLasConversaciones);
}

function mostrarListaConversaciones(lista) {
  listaUsuarios.innerHTML = '';
  lista.forEach(conv => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${conv.session_id}</strong><br>${conv.message?.content?.slice(0, 40) || ''}...`;
    li.addEventListener('click', () => cargarMensajes(conv.session_id));
    listaUsuarios.appendChild(li);
  });
}

async function cargarMensajes(sessionId) {
  const { data, error } = await supabase
    .from('n8n_personalagent_chat_histories')
    .select('message, id')
    .eq('session_id', sessionId)
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  tituloChat.innerText = `Conversación: ${sessionId}`;
  chatContainer.innerHTML = '';
  data.forEach(msg => {
    const role = msg.message?.type;
    const content = msg.message?.content;

    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(role === 'human' ? 'user' : 'bot');
    div.innerText = content || '';

    const hora = document.createElement('div');
    hora.classList.add('time');
    hora.innerText = `#${msg.id}`; // como no hay timestamp, mostramos el ID
    div.appendChild(hora);

    chatContainer.appendChild(div);
  });
}

buscador.addEventListener('input', () => {
  const filtro = buscador.value.toLowerCase();
  const filtradas = todasLasConversaciones.filter(c =>
    c.session_id.toLowerCase().includes(filtro) ||
    c.message?.content?.toLowerCase().includes(filtro)
  );
  mostrarListaConversaciones(filtradas);
});

cargarUsuarios();
