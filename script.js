const CHAVE = 'acoesBairro';
const CORES = { 'Ambiental': 'var(--ambiental)', 'Social': 'var(--social)', 'Educação': 'var(--educacao)', 'Saúde': 'var(--saude)' };

function lerAcoes() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || []; } catch (e) { return []; }
}
function salvarAcoes(lista) { localStorage.setItem(CHAVE, JSON.stringify(lista)); }
function esc(texto) {
  const d = document.createElement('div');
  d.textContent = texto;
  return d.innerHTML;
}


const ODS = [
  { n: 3,  nome: 'Saúde e Bem-Estar', cor: '#4C9F38', meta: 'Garantir vida saudável e promover o bem-estar para todos.', cats: ['Saúde'] },
  { n: 4,  nome: 'Educação de Qualidade', cor: '#C5192D', meta: 'Assegurar educação inclusiva e de qualidade para todos.', cats: ['Educação'] },
  { n: 10, nome: 'Redução das Desigualdades', cor: '#DD1367', meta: 'Reduzir as desigualdades e incluir quem mais precisa.', cats: ['Social'] },
  { n: 11, nome: 'Cidades e Comunidades Sustentáveis', cor: '#FD9D24', meta: 'Tornar as comunidades mais inclusivas, seguras e sustentáveis.', cats: ['Social', 'Ambiental'] },
  { n: 13, nome: 'Ação Contra a Mudança Global do Clima', cor: '#3F7E44', meta: 'Tomar medidas urgentes para combater a mudança do clima.', cats: ['Ambiental'] },
  { n: 15, nome: 'Vida Terrestre', cor: '#56C02B', meta: 'Proteger e recuperar os ecossistemas e a natureza.', cats: ['Ambiental'] },
  { n: 17, nome: 'Parcerias e Meios de Implementação', cor: '#19486A', meta: 'Fortalecer parcerias entre moradores, escola e governo.', cats: ['Ambiental', 'Social', 'Educação', 'Saúde'] }
];
function somar(lista) {
  return { acoes: lista.length, pessoas: lista.reduce((s, a) => s + (Number(a.participantes) || 0), 0) };
}
function textoImpacto(t) {
  if (t.acoes === 0) return 'Nenhuma ação registrada ainda';
  return `${t.acoes} ${t.acoes === 1 ? 'ação' : 'ações'} · ${t.pessoas} ${t.pessoas === 1 ? 'pessoa' : 'pessoas'}`;
}
function desenharImpacto(todas) {
  const barras = document.getElementById('impacto-categorias');
  const lista = document.getElementById('lista-ods');
  if (!barras || !lista) return;
  const porCat = Object.keys(CORES).map(c => ({ nome: c, ...somar(todas.filter(a => a.categoria === c)) }));
  const maximo = Math.max(1, ...porCat.map(c => c.pessoas));
  barras.innerHTML = porCat.map(c => `
    <div class="barra-linha" style="--cor:${CORES[c.nome]}">
      <span class="barra-nome">${c.nome}</span>
      <span class="barra-trilho"><span class="barra-valor" style="width:${(c.pessoas / maximo) * 100}%"></span></span>
      <span class="barra-texto">${textoImpacto(c)}</span>
    </div>`).join('');
  lista.innerHTML = ODS.map(o => {
    const t = somar(todas.filter(a => o.cats.includes(a.categoria)));
    return `
    <article class="ods" style="--cor-ods:${o.cor}">
      <div class="ods-num" aria-hidden="true">${o.n}</div>
      <div>
        <h3>ODS ${o.n} · ${o.nome}</h3>
        <p>${o.meta}</p>
        <p class="ods-impacto">${textoImpacto(t)}</p>
      </div>
    </article>`;
  }).join('');
}

/* ---------- Página de cadastro ---------- */
const formulario = document.getElementById('formulario-acao');
if (formulario) {
  const MENSAGENS_PADRAO = 'Preencha este campo.';

  function mensagemDe(campo) {
    if (campo.tagName === 'SELECT' && !campo.value) return 'Escolha uma categoria.';
    if (campo.type === 'number') {
      const n = Number(campo.value);
      if (campo.value === '' ) return 'Informe quantas pessoas participaram.';
      if (!Number.isInteger(n) || n < 1) return 'Informe um número inteiro maior que zero.';
      return '';
    }
    if (campo.required && campo.value.trim() === '') return MENSAGENS_PADRAO;
    return '';
  }
  function mostrarErro(campo, texto) {
    limparErro(campo);
    if (!texto) return;
    const p = document.createElement('p');
    p.className = 'erro-campo';
    p.id = campo.id + '-erro';
    p.textContent = texto;
    campo.parentNode.appendChild(p);
    campo.setAttribute('aria-invalid', 'true');
    campo.setAttribute('aria-describedby', p.id);
  }
  function limparErro(campo) {
    const antigo = document.getElementById(campo.id + '-erro');
    if (antigo) antigo.remove();
    campo.removeAttribute('aria-invalid');
    campo.removeAttribute('aria-describedby');
  }
  const campos = formulario.querySelectorAll('input, select, textarea');
  campos.forEach(c => {
    c.addEventListener('input', () => limparErro(c));
    c.addEventListener('change', () => limparErro(c));
  });

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    let primeiroInvalido = null;
    campos.forEach(c => {
      const erro = mensagemDe(c);
      mostrarErro(c, erro);
      if (erro && !primeiroInvalido) primeiroInvalido = c;
    });
    if (primeiroInvalido) { primeiroInvalido.focus(); return; }
    const acoes = lerAcoes();
    acoes.push({
      id: Date.now(),
      titulo: document.getElementById('titulo-acao').value.trim(),
      categoria: document.getElementById('categoria-acao').value,
      local: document.getElementById('local-acao').value.trim(),
      responsavel: document.getElementById('responsavel-acao').value.trim(),
      participantes: Number(document.getElementById('participantes-acao').value),
      descricao: document.getElementById('descricao-acao').value.trim()
    });
    salvarAcoes(acoes);
    window.location.href = 'index.html';
  });
}

/* ---------- Página do mural ---------- */
const mural = document.getElementById('mural-acoes');
if (mural) {
  let filtro = 'Todas';
  const filtros = document.getElementById('filtros');

  function desenhar() {
    const todas = lerAcoes();
    const lista = todas.filter(a => filtro === 'Todas' || a.categoria === filtro).reverse();

    document.getElementById('total-acoes').textContent = todas.length;
    document.getElementById('total-pessoas').textContent =
      todas.reduce((soma, a) => soma + (Number(a.participantes) || 0), 0);
    document.getElementById('total-categorias').textContent =
      new Set(todas.map(a => a.categoria)).size;
    desenharImpacto(todas);

    filtros.innerHTML = ['Todas', ...Object.keys(CORES)].map(c =>
      `<button type="button" aria-pressed="${c === filtro}" data-cat="${c}">${c}</button>`).join('');
    filtros.hidden = todas.length === 0;

    if (lista.length === 0) {
      mural.innerHTML = todas.length === 0
        ? '<div class="vazio"><p>Nenhuma ação registrada ainda. Seja o primeiro a incluir uma ação do bairro.</p><a class="botao" href="acao.html">Registrar uma ação</a></div>'
        : '<div class="vazio"><p>Nenhuma ação nesta categoria ainda.</p></div>';
      return;
    }

    mural.innerHTML = lista.map(a => `
      <article class="acao" style="--cor:${CORES[a.categoria] || 'var(--azul)'}">
        <span class="tag">${esc(a.categoria)}</span>
        <h3>${esc(a.titulo)}</h3>
        <p class="desc">${esc(a.descricao)}</p>
        <dl>
          <dt>Local</dt><dd>${esc(a.local)}</dd>
          <dt>Responsável</dt><dd>${esc(a.responsavel)}</dd>
          <dt>Participantes</dt><dd>${esc(String(a.participantes))}</dd>
        </dl>
        <button type="button" class="remover" data-id="${a.id}">Remover ação</button>
      </article>`).join('');
  }

  filtros.addEventListener('click', e => {
    if (e.target.dataset.cat) { filtro = e.target.dataset.cat; desenhar(); }
  });
  mural.addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (id && confirm('Remover esta ação do mural?')) {
      salvarAcoes(lerAcoes().filter(a => String(a.id) !== id));
      desenhar();
    }
  });
  desenhar();
}

/* ---------- Efeito de onda nos botões ---------- */
document.addEventListener('click', function (e) {
  const botao = e.target.closest('.botao');
  if (!botao) return;
  const r = botao.getBoundingClientRect();
  const d = Math.max(r.width, r.height);
  const onda = document.createElement('span');
  onda.className = 'onda';
  onda.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  botao.appendChild(onda);
  setTimeout(() => onda.remove(), 700);
});