// Ícone da marca (mesmo desenho de docs/branding/logo.svg): senha de papel com sinal de concluído.
export default function Logo({ tamanho = 40 }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 72 72" aria-hidden="true" focusable="false">
      <path d="M6 0h60a6 6 0 0 1 6 6v20a8 8 0 0 0 0 20v20a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V46a8 8 0 0 0 0-20V6a6 6 0 0 1 6-6z" fill="#fff" />
      <line x1="50" y1="8" x2="50" y2="64" stroke="#12355b" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M14 37l9 9 17-19" fill="none" stroke="#1f7a5a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
