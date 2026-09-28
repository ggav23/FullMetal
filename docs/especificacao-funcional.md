# Requisitos Funcionais

# 1. Identificação do Projeto

| Campo | Informação |
|---|---|
| **Sistema** | Fullmetal |
| **Data** | 15/09/2026 |
| **Versão do documento** | 0.1 |
| **Status** | Em elaboração |

---

# 2. Objetivo

> **Objetivo:**  
> Desenvolver uma primeira versão de um sistema web para centralizar o registro e o acompanhamento de demandas, substituindo os diferentes meios informais utilizados. A solução deverá permitir o cadastro, consulta, listagem e visualização de demandas, com interface responsiva e acessível (aderente às diretrizes WCAG/eMAG).
---

# 3. Contexto / Problema Atual

Descrever como o processo funciona atualmente e qual problema deverá ser resolvido.

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

| Perfil | Descrição | Principais permissões |
|---|---|---|
| Solicitante | Usuário que registra uma demanda e acompanha seu atendimento. | Cadastrar novas demandas, visualizar suas próprias demandas, consultar detalhes de solicitações e acompanhar o status.|
| Triagem | Usuário responsável pela análise inicial das demandas recebidas e pelo encaminhamento ao setor adequado. | Visualizar demandas pendentes, validar informações recebidas e encaminhar para o setor ou alterar status. |
| Responsável | Usuário do setor responsável pelo tratamento das demandas encaminhadas ao departamento. | Consultar demandas atribuídas a sua unidade, atualizar o andamento e finalizar o atendimento da demanda. |                                                |                                                     |
 

---

# 6. Requisitos Funcionais

### RF-001 - O sistema deverá permitir que o usuário cadastre uma nova demanda por meio de um formulário simplificado.

### RF-002 - O sistema deverá exibir uma lista com todas as demandas cadastradas, permitindo ordenação, busca por palavra-chave e filtragem por situação/status.

### RF-003 - O sistema deverá permitir a consulta detalhada de uma solicitação específica ao clicar sobre ela na listagem.

### RF-004 - O sistema deve impedir o envio de uma demanda enquanto algum dos campos obrigatórios não estiver preenchido.

### RNF-001 - A interface da aplicação deve ser integralmente operável via teclado, legível por leitores de tela (como NVDA/TalkBack) e possuir alto contraste de cores para atender pessoas com deficiência.

### RNF-002 - A aplicação deve ser desenvolvida sob a abordagem Mobile-First, garantindo pleno funcionamento em telas a partir de 320px de largura e otimizada para conexões de baixa velocidade.



# 7. Regras de Negócio

## RN-001 — Toda demanda deve possuir uma identificação única.

## RN-002 — Toda demanda deve possuir solicitante, categoria, descrição e unidade responsável.

## RN-003 — Toda demanda deve possuir um dos seguintes status: Pendente, Em atendimento, Concluída e Cancelada.


# 8. Validações

| ID | Campo / Funcionalidade | Validação | Mensagem |
|---|---|---|---|
| VAL-001 |Título da Demanda |Não pode ser vazio e deve ter entre 5 e 100 caracteres. |"O título deve conter entre 5 e 100 caracteres." |
| VAL-002 |Descrição |Preenchimento obrigatório com até 500 caracteres. |"Por favor, descreva o problema com até 500 caracteres." |
| VAL-003 |Categoria |Seleção obrigatória de um item do dropdown. |"Selecione uma categoria válida para a demanda."|
| VAL-004 |Localização |Não pode conter apenas espaços em branco. |"Informe o local ou sala onde ocorreu a demanda."|
---

# 9. Campos
id, titulo, categoria, localizacao, descricao, status, dataCriacao.

---

# 10. Situações

Situação | Descrição |
Pendente |Demanda aguardando triagem.|
Em Atendimento |Demanda direcionada a área responsável e em execução.|
Concluída |Solicitação resolvida|
Cancelada |Demanda cancelada|

---

# 11. Permissões

| Funcionalidade | Solicitante | Triagem | Responsável|
|---|:---:|:---:|:---:|
| Visualizar Listagem | [ ] | [X]  | [ ] |
| Cadastrar Demanda | [X] | [ ] | [ ] |
| Consultar Detalhes | [X] | [X] | [X] |
| Alterar Status | [ ] | [X] | [X] |
| Cancelar Demanda | [X] | [X] | [ ] |

---

# 12. Telas

## Tela 01 — Listagem de Demandas

### Objetivo

Exibir as demandas às quais o usuário possui acesso, permitindo consulta, busca e aplicação de filtros.


### Visibilidade por perfil

| Perfil | Demandas visíveis |
|---|---|
| Solicitante | Apenas demandas criadas pelo próprio usuário |
| Triagem | Todas as demandas cadastradas |
| Área Responsável | Apenas demandas encaminhadas para sua unidade |

### Componentes

- Cabeçalho de navegação
- Barra de pesquisa
- Filtros
- Lista de demandas
- Indicadores de estado:
  - carregando;
  - lista vazia;
  - erro.

### Ações por perfil

| Ação | Solicitante | Triagem | Unidade |
|---|---:|---:|---:|
| Nova Demanda | Sim | Não | Não |
| Ver Detalhes | Sim | Sim | Sim |
| Limpar Filtros | Sim | Sim | Sim |

## Tela 02 — Formulário de Cadastro

### Objetivo da tela

Coletar os dados da solicitação.

### Componentes

- Formulário Estruturado
- Área de Notificação Acessível
- Botões de Ação com Rótulos Claros

### Botões / Ações

| Ação | Comportamento esperado |
|---|---|
| Salvar Demanda | Valida os campos, salva os dados no JSON simulado e exibe mensagem de sucesso |
| Cancelar / Voltar | Abandona o formulário e retorna para a listagem de demandas |

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

| Ação | Solicitante | Triagem | Responsável |
|---|---:|---:|---:|
| Voltar para Listagem | Sim | Sim | Sim |
| Cancelar Demanda | Sim | Sim | Não |
| Encaminhar Demanda | Não | Sim | Não |
| Alterar Status | Não | Sim | Sim |
| Concluir Demanda | Não | Não | Sim |
---