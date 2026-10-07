const formulario = document.getElementById('formulario-acao');
const muralAcoes = document.getElementById('mural-acoes');

if (formulario) {
  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const novaAcao = {
      titulo: document.getElementById('titulo-acao').value,
      categoria: document.getElementById('categoria-acao').value,
      local: document.getElementById('local-acao').value,
      responsavel: document.getElementById('responsavel-acao').value,
      participantes: document.getElementById('participantes-acao').value,
      descricao: document.getElementById('descricao-acao').value,
      id: Date.now()
    };

    const acoesSalvas = JSON.parse(localStorage.getItem('acoesBairro')) || [];
    acoesSalvas.push(novaAcao);
    localStorage.setItem('acoesBairro', JSON.stringify(acoesSalvas));

    window.location.href = 'index.html';
  });
}

if (muralAcoes) {
  const acoesSalvas = JSON.parse(localStorage.getItem('acoesBairro')) || [];

  if (acoesSalvas.length > 0) {
    muralAcoes.innerHTML = '';
    muralAcoes.style.display = 'grid';
    muralAcoes.style.gridTemplateColumns = '1fr';
    muralAcoes.style.gap = '20px';
    muralAcoes.style.border = 'none';
    muralAcoes.style.backgroundColor = 'transparent';
    muralAcoes.style.padding = '0';

    acoesSalvas.forEach(function (acao) {
      const card = document.createElement('div');
      card.style.backgroundColor = '#1a1e1c';
      card.style.border = '1px solid #38423d';
      card.style.borderRadius = '12px';
      card.style.padding = '20px';
      card.style.textAlign = 'left';

      card.innerHTML = `
        <h3 style="color: #62b189; margin-bottom: 8px; font-size: 1.3rem;">${acao.titulo}</h3>
        <p style="margin-bottom: 6px; font-size: 0.95rem;"><strong style="color: #a3b8ac;">Categoria:</strong> ${acao.categoria}</p>
        <p style="margin-bottom: 6px; font-size: 0.95rem;"><strong style="color: #a3b8ac;">Local:</strong> ${acao.local}</p>
        <p style="margin-bottom: 6px; font-size: 0.95rem;"><strong style="color: #a3b8ac;">Responsável:</strong> ${acao.responsavel}</p>
        <p style="margin-bottom: 12px; font-size: 0.95rem;"><strong style="color: #a3b8ac;">Participantes:</strong> ${acao.participantes}</p>
        <p style="color: #e3eae5; background-color: #252b28; padding: 12px; border-radius: 8px; font-size: 0.95rem;">${acao.descricao}</p>
      `;

      muralAcoes.appendChild(card);
    });
  }
}
