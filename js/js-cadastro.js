document.addEventListener("DOMContentLoaded", () => {
    // simulação do usuário logado (opcional)
    const perfilAtual = document.getElementById("perfil-atual");
    if (perfilAtual) {
      perfilAtual.textContent = "Solicitante";
    }
  
    // configurar categorias e habilitar o formulario
    const categoriasAprovadas = [
      { valor: "manutencao", rotulo: "Manutenção" },
      { valor: "ti", rotulo: "Suporte de TI" },
      { valor: "rh", rotulo: "Recursos Humanos" },
    ];
  
    const selectCategoria = document.getElementById("categoria");
    const ajudaCategoria = document.getElementById("ajuda-categoria");
    const btnSubmit = document.querySelector('button[type="submit"]');
  
    // adiciona as categorias no select
    categoriasAprovadas.forEach(categoria => {
      const option = document.createElement("option");
      option.value = categoria.valor;
      option.textContent = categoria.rotulo;
      selectCategoria.appendChild(option);
    });
  
    // habilita os campos apos as opcoes estarem prontas
    selectCategoria.removeAttribute("disabled");
    btnSubmit.removeAttribute("disabled");
    ajudaCategoria.textContent = "Selecione a categoria adequada para sua solicitação.";
  
    // logica de envio do formulario
    const form = document.getElementById("formulario-demanda");
    const msgErro = document.getElementById("mensagem-erro");
    const msgSucesso = document.getElementById("mensagem-sucesso");
  
    form.addEventListener("submit", (evento) => {
      evento.preventDefault(); // impede a pagina de recarregar
  
      // esconde mensagens antigas
      msgErro.hidden = true;
      msgSucesso.hidden = true;
  
      // coleta os dados do formulario
      const formData = new FormData(form);
      const dadosDemanda = Object.fromEntries(formData.entries());
  
      // validação extra simples
      if (dadosDemanda.categoria === "") {
        mostrarErro("Por favor, selecione uma categoria válida.");
        return;
      }
  
      // altera estado do botao para indicar carregamento
      btnSubmit.disabled = true;
      btnSubmit.textContent = "Salvando...";
  
      // simula um tempo de requisicao para o servidor
      setTimeout(() => {
        try {
          // salvando no localstorage para funcionar de verdade no navegador
          const demandasSalvas = JSON.parse(localStorage.getItem('demandas_fullmetal')) || [];
          
          // adiciona metadados
          dadosDemanda.id = Date.now(); // ID único simples
          dadosDemanda.dataCriacao = new Date().toISOString();
          
          demandasSalvas.push(dadosDemanda);
          localStorage.setItem('demandas_fullmetal', JSON.stringify(demandasSalvas));
  
          // feedback de sucesso
          mostrarSucesso("Demanda registrada com sucesso!");
          form.reset(); // Limpa o formulário
          
        } catch (erro) {
          mostrarErro("Ocorreu um erro ao salvar a demanda. Tente novamente.");
          console.error(erro);
        } finally {
          // restaura o botao original
          btnSubmit.disabled = false;
          btnSubmit.textContent = "Salvar demanda";
        }
      }, 1000);
    });
  
    // funcoes auxiliares para mostrar mensagens
    function mostrarErro(mensagem) {
      msgErro.textContent = mensagem;
      msgErro.hidden = false;
    }
  
    function mostrarSucesso(mensagem) {
      msgSucesso.textContent = mensagem;
      msgSucesso.hidden = false;
    }
  });