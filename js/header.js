(() => {
  const contrastButton = document.querySelector('[data-contrast-toggle]');
  if (!contrastButton) return;

  const preferenceKey = 'fullmetal-high-contrast';
  let contrastEnabled = false;

  // Recupero a preferência sem depender do armazenamento para o botão funcionar.
  try {
    contrastEnabled = localStorage.getItem(preferenceKey) === 'true';
  } catch {
    // O navegador pode bloquear o armazenamento em arquivos locais.
  }

  function updateContrast() {
    document.body.classList.toggle('high-contrast', contrastEnabled);
    contrastButton.setAttribute('aria-pressed', String(contrastEnabled));
    contrastButton.setAttribute(
      'aria-label',
      contrastEnabled ? 'Desativar alto contraste' : 'Ativar alto contraste'
    );
  }

  updateContrast();
  contrastButton.hidden = false;

  contrastButton.addEventListener('click', () => {
    contrastEnabled = !contrastEnabled;
    updateContrast();

    try {
      localStorage.setItem(preferenceKey, String(contrastEnabled));
    } catch {
      // A preferência continua ativa nesta página mesmo sem armazenamento.
    }
  });
})();
