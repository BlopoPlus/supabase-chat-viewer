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
    .select('conversation_id, role, content, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  // Agrupar por conversation_id y obtener el primer mensaje como vista previa
  const agrupadas = {};
  data.forEach(row => {
    if (!agrupadas[row.conversation_id]) {
      agrupadas[row.conversation_id] = row;
    }
  });

  todasLasConversaciones = Object.values(agrupadas);
  mostrarListaConversaciones(todasLasConversaciones);
}

function mostrarListaConversaciones(lista) {
  listaUsuarios.innerHTML = '';
  lista.forEach(conv => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${conv.conversation_id.slice(0, 6)}</strong><br>${conv.content.slice(0, 40)}...`;
    li.addEventListener('click', () => cargarMensajes(conv.conversation_id));
    listaUsuarios.appendChild(li);
  });
}

async function cargarMensajes(conversationId) {
  const { data, error } = await supabase
    .from('n8n_personalagent_chat_histories')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  tituloChat.innerText = `Conversación: ${conversationId.slice(0, 6)}`;
  chatContainer.innerHTML = '';
  data.forEach(msg => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(msg.role === 'user' ? 'user' : 'bot');
    div.innerText = msg.content;

    const hora = document.createElement('div');
    hora.classList.add('time');
    hora.innerText = new Date(msg.created_at).toLocaleTimeString('es-CL', {
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
    c.content.toLowerCase().includes(filtro) ||
    c.conversation_id.toLowerCase().includes(filtro)
  );
  mostrarListaConversaciones(filtradas);
});

cargarUsuarios();
