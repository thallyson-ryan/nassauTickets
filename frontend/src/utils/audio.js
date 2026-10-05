// Áudio da chamada usando a Web Speech API do navegador.
export function falarChamada(ticket, guiche, ultima = false) {
  if (!('speechSynthesis' in window)) return;
  const prioridade = { SP: 'prioritária', SG: 'geral', SE: 'exames' }[ticket.tipo];
  const seq = Number(ticket.numero.slice(-3));
  const texto = `${ultima ? 'Última chamada. ' : ''}Senha ${prioridade} ${seq}, guichê ${guiche}`;
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  window.speechSynthesis.speak(fala);
}
