/**
 * Painel de Demandas - Gerador Dinâmico da Listagem
 */

'use strict';

// Dados simulados da aplicação
const DEMANDAS_SIMULADAS = [
  {
    id: "001",
    titulo: "Falha na conexão de rede no Laboratório 3",
    descricao: "Os computadores da fileira B não conseguem obter endereço IP.",
    categoria: "Rede",
    departamento: "ti",
    status: "pendente",
    solicitante: "Edward Elric",
    dataCriacao: "2026-09-28T10:30:00"
  },
  {
    id: "002",
    titulo: "Vazamento na torneira do banheiro masculino",
    descricao: "Gotejamento contínuo causando desperdício de água.",
    categoria: "Hidráulica",
    departamento: "manutencao",
    status: "andamento",
    solicitante: "Alphonse Elric",
    dataCriacao: "2026-09-27T14:15:00"
  },
  {
    id: "003",
    titulo: "Atualização de cadastros de novos servidores",
    descricao: "Solicitação de inclusão de documentação no sistema do RH.",
    categoria: "Pessoal",
    departamento: "rh",
    status: "concluido",
    solicitante: "Roy Mustang",
    dataCriacao: "2026-09-25T09:00:00"
  }
];

const MAPA_DEPARTAMENTOS = {
  ti: "T.I.",
  manutencao: "Manutenção",
  rh: "Recursos Humanos"
};

const MAPA_STATUS = {
  pendente: "Pendente",
  andamento: "Em Andamento",
  concluido: "Concluído"
};

document.addEventListener('DOMContentLoaded', () => {
  PainelDemandas.init();
});

const PainelDemandas = {
  listaContainer: null,
  formProcura: null,
  inputBusca: null,
  selectDepartamento: null,
  selectStatus: null,

  init() {
    this.listaContainer = document.getElementById('lista-demandas');
    this.formProcura = document.querySelector('search form');
    this.inputBusca = document.getElementById('termo-busca');
    this.selectDepartamento = document.getElementById('filtro-departamento');
    this.selectStatus = document.getElementById('Status');

    this.registarEventos();
    this.renderizarListagem(DEMANDAS_SIMULADAS);
  },

  registarEventos() {
    const filtrar = () => {
      const termo = this.inputBusca?.value.toLowerCase().trim() || '';
      const depto = this.selectDepartamento?.value || '';
      const status = this.selectStatus?.value || '';

      const filtradas = DEMANDAS_SIMULADAS.filter(item => {
        const correspondeTermo = !termo || item.titulo.toLowerCase().includes(termo) || item.id.toLowerCase().includes(termo);
        const correspondeDepto = !depto || item.departamento === depto;
        const correspondeStatus = !status || item.status === status;
        return correspondeTermo && correspondeDepto && correspondeStatus;
      });

      this.renderizarListagem(filtradas);
    };

    this.formProcura?.addEventListener('submit', (e) => {
      e.preventDefault();
      filtrar();
    });

    this.inputBusca?.addEventListener('input', filtrar);
    this.selectDepartamento?.addEventListener('change', filtrar);
    this.selectStatus?.addEventListener('change', filtrar);
  },

  /**
   * Lê os dados simulados, percorre e gera dinamicamente os elementos no DOM.
   */
  renderizarListagem(dados) {
    if (!this.listaContainer) return;

    // Limpa a listagem anterior
    this.listaContainer.innerHTML = '';

    // Estado vazio
    if (!dados || dados.length === 0) {
      const liVazio = document.createElement('li');
      liVazio.className = 'empty-state';
      liVazio.textContent = 'Nenhuma demanda encontrada.';
      this.listaContainer.appendChild(liVazio);
      return;
    }

    const fragmento = document.createDocumentFragment();

    // Percorre cada elemento dos dados
    dados.forEach(demanda => {
      const li = document.createElement('li');
      
      const deptoNome = MAPA_DEPARTAMENTOS[demanda.departamento] || demanda.departamento;
      const statusNome = MAPA_STATUS[demanda.status] || demanda.status;
      const dataFormatada = this.formatarData(demanda.dataCriacao);

      // Ligação individual à página de detalhes através do ID na URL
      const urlDetalhes = `detalhes-da-demanda.html?id=${encodeURIComponent(demanda.id)}`;

      li.innerHTML = `
        <article class="card-demanda">
          <header class="card-header">
            <span class="card-id">#${this.escaparHTML(demanda.id)}</span>
            <span class="status-badge" data-status="${this.escaparHTML(demanda.status)}">
              ${this.escaparHTML(statusNome)}
            </span>
          </header>
          
          <div>
            <h3 class="card-title">${this.escaparHTML(demanda.titulo)}</h3>
            <div class="card-metadata">
              <p><strong>Departamento:</strong> ${this.escaparHTML(deptoNome)}</p>
              <p><strong>Solicitante:</strong> ${this.escaparHTML(demanda.solicitante || 'Não informado')}</p>
            </div>
          </div>

          <footer class="card-footer">
            <time datetime="${this.escaparHTML(demanda.dataCriacao)}">${dataFormatada}</time>
            <a class="btn btn-secondary" href="${urlDetalhes}">Ver detalhes</a>
          </footer>
        </article>
      `;

      fragmento.appendChild(li);
    });

    this.listaContainer.appendChild(fragmento);
  },

  formatarData(dataIso) {
    if (!dataIso) return '';
    try {
      return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(dataIso));
    } catch {
      return dataIso;
    }
  },

  escaparHTML(texto) {
    if (typeof texto !== 'string') return texto;
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};