# Requisitos Funcionais

# 1. Identificação do Projeto

| Campo                   | Informação   |
| ----------------------- | ------------ |
| **Sistema**             | Fullmetal    |
| **Data**                | 15/09/2026   |
| **Última atualização**  | 03/10/2026   |
| **Versão do documento** | 0.2          |
| **Status**              | Em validação |

---

# 2. Objetivo

> **Objetivo:**  
> Desenvolver uma primeira versão de um sistema web para centralizar o registro e o acompanhamento de demandas, substituindo os diferentes meios informais utilizados. A solução deverá permitir o cadastro, consulta, listagem e visualização de demandas, com interface responsiva e acessível (aderente às diretrizes WCAG/eMAG).

---

# 3. Contexto / Problema Atual

> **Cenário atual:**  
> No Instituto Alquimista de Aço, as solicitações e demandas de manutenção e suporte nascem por seis canais desorganizados: e-mail, mensagem de texto, formulário físico em papel, ligação telefônica, conversas informais de corredor e o aviso verbal ("eu avisei alguém").

> **Problema identificado:**  
> A dispersão dos canais gera perda de solicitações, falta de rastreabilidade, desconhecimento sobre quem é o responsável pela demanda e atrasos na resolução. Além disso, a falta de padronização e de acessibilidade impede que pessoas com deficiência ou em dispositivos móveis/conexão fraca consigam registrar ou acompanhar seus pedidos com eficiência.

# 4. Escopo

## 4.1 Está dentro do escopo

> Desenvolver uma interface web Front-end responsiva (mobile-first) e acessível conforme diretrizes WCAG 2.1 e eMAG (Nível AA).
> Implementar formulário simplificado de cadastro de demandas com validações em tempo real e mensagens acessíveis.
> Implementar telas de listagem, consulta com filtros por status/busca e visualização detalhada de demandas.
> Utilizar dados simulados em formato JSON.
> Representar claramente na interface os estados de carregamento, lista vazia, sucesso e erro.

## 4.2 Não está dentro do escopo

> Implementação de arquitetura de Back-end.
> Apoio popular de sugestões.

# 5. Perfis de Usuário

| Perfil      | Descrição                                                                         | Principais permissões                                                                                                  |
| ----------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Solicitante | Usuário que registra uma demanda e acompanha seu atendimento.                     | Cadastrar novas demandas, visualizar suas próprias demandas, consultar detalhes de solicitações e acompanhar o status. |
| Triagem     | Usuário responsável pela análise inicial e pelo encaminhamento ao setor adequado. | Consultar demandas, encaminhar as pendentes e cancelar demandas ativas.                                                |
| Responsável | Usuário do setor responsável pelo tratamento das demandas encaminhadas.           | Consultar demandas de sua unidade, definir prioridade, iniciar e concluir o atendimento.                               |

---

# 6. Requisitos Funcionais

### RF-001 - O sistema deverá permitir que o usuário cadastre uma nova demanda por meio de um formulário simplificado.

### RF-002 - O sistema deverá listar as demandas permitidas ao perfil, com busca e filtros por status. A listagem principal deve permitir ordenar por data de criação, das mais recentes ou das mais antigas.

### RF-003 - O sistema deverá permitir a consulta detalhada de uma solicitação específica ao clicar sobre ela na listagem.

### RF-004 - O sistema deve impedir o envio de uma demanda enquanto algum dos campos obrigatórios não estiver preenchido.

### RNF-001 - A interface da aplicação deve ser integralmente operável via teclado, legível por leitores de tela (como NVDA/TalkBack) e possuir alto contraste de cores para atender pessoas com deficiência.

### RNF-002 - A aplicação deve ser desenvolvida sob a abordagem Mobile-First, garantindo pleno funcionamento em telas a partir de 320px de largura e otimizada para conexões de baixa velocidade.

# 7. Regras de Negócio

## RN-001 — Toda demanda deve possuir uma identificação única.

## RN-002 — Toda demanda deve possuir solicitante, categoria, descrição e localização. A unidade responsável é definida pela Triagem no encaminhamento.

Antes do encaminhamento, a unidade fica vazia. A demanda continua Pendente até o Responsável iniciar o atendimento.

## RN-003 — Toda demanda deve possuir um dos seguintes status: Pendente, Em atendimento, Concluída e Cancelada.

## RN-004 — Somente o Responsável pode definir a prioridade de demandas ativas da sua unidade.

## RN-005 — Demandas concluídas ou canceladas não permitem novas ações de andamento.

# 8. Validações

| ID      | Campo / Funcionalidade | Validação                                               | Mensagem                                                 |
| ------- | ---------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| VAL-001 | Título da Demanda      | Não pode ser vazio e deve ter entre 5 e 100 caracteres. | "O título deve conter entre 5 e 100 caracteres."         |
| VAL-002 | Descrição              | Preenchimento obrigatório com até 500 caracteres.       | "Por favor, descreva o problema com até 500 caracteres." |
| VAL-003 | Categoria              | Seleção obrigatória de um item do dropdown.             | "Selecione uma categoria válida para a demanda."         |
| VAL-004 | Localização            | Preenchimento obrigatório com até 100 caracteres, sem aceitar apenas espaços em branco. | "Informe o local ou sala onde ocorreu a demanda." / "A localização deve conter até 100 caracteres." |

---

# 9. Campos

id, titulo, categoria, localizacao, descricao, status, solicitanteId, solicitante, unidade, prioridade, dataCriacao, historico.

`solicitanteId` identifica o autor. `solicitante` é o nome, quando informado.

---

# 10. Situações

| Situação       | Descrição                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------- |
| Pendente       | Demanda aguardando triagem ou, após o encaminhamento, início de atendimento pela unidade. |
| Em atendimento | Demanda direcionada à área responsável e em execução.                                     |
| Concluída      | Solicitação resolvida.                                                                    |
| Cancelada      | Demanda cancelada.                                                                        |

---

# 11. Permissões

| Funcionalidade                 | Solicitante | Triagem | Responsável |
| ------------------------------ | :---------: | :-----: | :---------: |
| Visualizar demandas permitidas |     [X]     |   [X]   |     [X]     |
| Cadastrar Demanda              |     [X]     |   [ ]   |     [ ]     |
| Consultar Detalhes             |     [X]     |   [X]   |     [X]     |
| Alterar Status                 |     [ ]     |   [X]   |     [X]     |
| Cancelar Demanda               |     [X]     |   [X]   |     [ ]     |
| Encaminhar Demanda             |     [ ]     |   [X]   |     [ ]     |
| Definir Prioridade             |     [ ]     |   [ ]   |     [X]     |
| Iniciar Atendimento            |     [ ]     |   [ ]   |     [X]     |
| Concluir Atendimento           |     [ ]     |   [ ]   |     [X]     |

As ações dependem do perfil e do estado da demanda.

---

# 12. Telas

## Tela 01 — Listagem de Demandas

### Objetivo

Exibir as demandas às quais o usuário possui acesso, permitindo consulta, busca e aplicação de filtros.

### Visibilidade por perfil

| Perfil           | Demandas visíveis                             |
| ---------------- | --------------------------------------------- |
| Solicitante      | Apenas demandas criadas pelo próprio usuário  |
| Triagem          | Todas as demandas cadastradas                 |
| Área Responsável | Apenas demandas encaminhadas para sua unidade |

### Componentes

- Cabeçalho de navegação
- Barra de pesquisa
- Filtros
- Ordenação por data de criação na listagem principal
- Lista de demandas
- Indicadores de estado:
  - carregando;
  - lista vazia;
  - erro.

### Ações por perfil

| Ação           | Solicitante | Triagem | Unidade |
| -------------- | ----------: | ------: | ------: |
| Nova Demanda   |         Sim |     Não |     Não |
| Ver Detalhes   |         Sim |     Sim |     Sim |
| Limpar Filtros |         Sim |     Sim |     Sim |

Limpar os filtros mantém a ordenação escolhida. Registros sem data válida ficam no fim.

## Tela 02 — Formulário de Cadastro

### Objetivo da tela

Coletar os dados da solicitação.

### Componentes

- Formulário Estruturado
- Área de Notificação Acessível
- Botões de Ação com Rótulos Claros

### Botões / Ações

| Ação              | Comportamento esperado                                              |
| ----------------- | ------------------------------------------------------------------- |
| Salvar Demanda    | Valida os campos, salva no localStorage e exibe mensagem de sucesso |
| Cancelar / Voltar | Abandona o formulário e retorna para a listagem de demandas         |

## Tela 03 — Detalhes da Demanda

### Objetivo

Exibir as informações completas de uma demanda selecionada.

### Componentes

- Identificador da demanda
- Título
- Solicitante
- Categoria
- Localização
- Descrição
- Status
- Unidade responsável
- Data de criação
- Histórico da demanda

### Ações por perfil

| Ação                 | Solicitante | Triagem | Responsável |
| -------------------- | ----------: | ------: | ----------: |
| Voltar para Listagem |         Sim |     Sim |         Sim |
| Cancelar Demanda     |         Sim |     Sim |         Não |
| Encaminhar Demanda   |         Não |     Sim |         Não |
| Alterar Status       |         Não |     Sim |         Sim |
| Concluir Demanda     |         Não |     Não |         Sim |
| Definir Prioridade   |         Não |     Não |         Sim |
| Iniciar Atendimento  |         Não |     Não |         Sim |

---

# 13. Execução e dados de exemplo

Abra `index.html` por arquivo local ou HTTP em `localhost` ou `127.0.0.1`. Os perfis são usados para desenvolvimento, sem autenticação real. Esse modo não fica habilitado em outros domínios.

Os exemplos de `dados/demandas-exemplo.json` são importados por `dados-de-teste.html`, sem substituir registros existentes. Cadastros e alterações ficam no localStorage, sem escrever no JSON. Os dados ficam no navegador e na origem em que o sistema foi aberto.

A revisão manual de teclado, leitor de tela e zoom ainda está pendente para validar o nível AA.
