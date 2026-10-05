# Registro de Desenvolvimento 02 — JavaScript, Regras e Integração

**Projeto:** Fullmetal  
**Período de referência:** 30/09–01/10/2026  
**Etapas:** JavaScript, dados simulados, regras de negócio e integração  
**Registro consolidado retrospectivamente em:** 05/10/2026

> **Nota sobre o registro:** Este documento foi reconstruído retrospectivamente a partir do backlog, requisitos e implementação do projeto. As discussões não foram registradas formalmente no momento em que aconteceram; portanto, são apresentados principalmente tópicos e decisões que podem ser relacionados às tarefas efetivamente desenvolvidas.

### Tópicos abordados

- utilização de dados simulados;
- renderização das demandas pelo JavaScript;
- cadastro de novas demandas;
- navegação entre listagem e detalhes;
- criação e troca dos perfis de usuário;
- validações do formulário;
- busca, filtros e ordenação;
- regras de visibilidade por perfil;
- status e ações disponíveis;
- cancelamento e encaminhamento;
- integração entre as diferentes telas.

## 1. Objetivo do período

Transformar as telas construídas anteriormente em uma aplicação funcional utilizando JavaScript e dados simulados.

A primeira parte do período foi dedicada aos fluxos básicos — cadastro, listagem, detalhes e seleção de perfil.

Em seguida, o trabalho passou para as regras de negócio e integração entre esses comportamentos.

## 2. Principais decisões

### Utilizar dados simulados como fonte das demandas

Como o projeto não possuía backend nesta etapa, as demandas passaram a ser manipuladas a partir de dados simulados.

A interface deixou de depender de registros escritos diretamente no HTML e passou a renderizar os dados dinamicamente.

Isso permitiu que cadastro, listagem, detalhes e alterações de estado trabalhassem sobre a mesma representação das demandas.

### Gerar a listagem dinamicamente

A listagem passou a ser produzida pelo JavaScript a partir dos dados disponíveis.

Cada item foi conectado à tela de detalhes por meio de seu identificador, permitindo que demandas diferentes apresentassem informações diferentes.

Também foi previsto tratamento para identificadores inexistentes, evitando a exibição de informações incorretas.

### Criar o conceito de perfil ativo

Foi implementado um perfil atual para permitir a demonstração dos três tipos de usuário:

- Solicitante;
- Triagem;
- Responsável.

A troca de perfil passou a influenciar a interface e serviu posteriormente como base para permissões e visibilidade das demandas.

### Definir o comportamento do cadastro

O formulário passou a criar efetivamente novas demandas.

No cadastro, foram consideradas informações como:

- identificação única;
- título;
- descrição;
- categoria;
- localização;
- status inicial;
- data de criação.

As novas demandas recebem inicialmente o status **Pendente** e ficam disponíveis para consulta no sistema.

### Aplicar as validações documentadas

Foram implementadas as regras previamente definidas para impedir cadastros inválidos.

Entre elas:

- título entre 5 e 100 caracteres;
- descrição obrigatória com até 500 caracteres;
- categoria obrigatória;
- localização não composta apenas por espaços.

Os erros passaram a bloquear o envio e apresentar mensagens ao usuário.

### Integrar busca, filtros e ordenação

A listagem passou a permitir busca e filtragem das demandas.

Foi adotado o comportamento de atualização dinâmica dos resultados conforme os critérios selecionados, além da possibilidade de limpar os filtros e retornar à listagem disponível ao perfil.

Posteriormente, durante os testes, foi observado que esse comportamento tornou o botão **Aplicar** pouco necessário, ficando como ponto de melhoria de UX.

### Aplicar regras diferentes para cada perfil

A interface passou a considerar as responsabilidades de cada usuário.

De forma geral:

- **Solicitante:** registra e acompanha demandas;
- **Triagem:** analisa e encaminha demandas;
- **Responsável:** recebe demandas encaminhadas e atualiza seu andamento.

Essa diferenciação passou a controlar tanto a visibilidade quanto as ações disponíveis.

### Implementar alterações de status e ações

Foram integradas ações como:

- cancelamento;
- encaminhamento;
- atualização do andamento;
- conclusão.

Para ações importantes, como o cancelamento, foi utilizado modal de confirmação para reduzir operações acidentais.

## 3. Organização do trabalho

O backlog separou esta fase em duas etapas principais:

| Etapa | Principais atividades |
|---|---|
| **30/09 — JavaScript: dados, DOM e fluxos básicos** | Detalhes, perfis, listagem e cadastro |
| **01/10 — JavaScript: regras e integração** | Validações, busca/filtros, visibilidade e ações/status |

Essa divisão permitiu primeiro tornar as telas dinâmicas e, depois, incorporar as regras específicas do funcionamento do sistema.

## 4. Resultado

Ao final do período, a aplicação já possuía um fluxo funcional utilizando dados simulados.

Entre os principais resultados estavam:

- demandas renderizadas dinamicamente;
- cadastro de novas demandas;
- geração de identificadores;
- consulta de detalhes;
- tratamento de ID inexistente;
- troca entre os três perfis;
- validação do formulário;
- busca e filtros;
- alterações de status;
- encaminhamento e cancelamento.

A aplicação deixou de ser apenas uma sequência de telas e passou a representar o fluxo básico de gerenciamento das demandas.

## 5. Pontos percebidos posteriormente

A integração revelou alguns pontos que precisaram ser revisados ou discutidos durante os testes.

Um deles foi a **identificação do Solicitante**. A regra previa que cada Solicitante visualizasse apenas suas próprias demandas, porém os testes posteriores encontraram registros apresentando o solicitante como **“não informado”**, dificultando comprovar completamente essa separação.

Também foram observadas questões relacionadas às regras de transição, como:

- encaminhar repetidamente uma mesma demanda;
- trocar várias vezes a unidade responsável;
- possibilidade de cancelamento após o encaminhamento;
- alterações repetidas de prioridade;
- excesso de eventos no Histórico de Andamento.

Parte desses comportamentos foi tratada como melhoria e parte permaneceu para discussão, pois dependia de definição mais precisa das regras de negócio.

## 6. Avaliação do período

Esta foi a etapa em que ocorreram mais dependências entre trabalhos diferentes.

Cadastro, listagem, detalhes, perfis e regras de negócio precisavam utilizar os mesmos dados e refletir alterações de maneira consistente entre as telas.

Os testes posteriores mostraram que a maior parte dessa integração funcionou corretamente, mas também evidenciaram a importância de especificar melhor algumas regras antes de implementá-las.

O principal aprendizado do período foi que fazer uma funcionalidade funcionar isoladamente não garante que o fluxo completo esteja correto. Visibilidade, permissões, estados e persistência precisaram ser avaliados posteriormente de forma integrada.