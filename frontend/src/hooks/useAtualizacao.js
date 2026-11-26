import { useCallback, useEffect, useRef, useState } from 'react';

// Busca dados periodicamente. Se o backend falhar, mantém os últimos dados válidos
// e informa a falha, para a tela continuar útil (estratégia de recuperação).
export default function useAtualizacao(buscar, intervaloMs, ativo = true) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  const recarregar = useCallback(async () => {
    try {
      const novo = await buscarRef.current();
      setDados(novo);
      setErro(null);
      setAtualizadoEm(new Date());
    } catch (e) {
      setErro(e);
    }
  }, []);

  useEffect(() => {
    if (!ativo) return undefined;
    recarregar();
    const id = setInterval(recarregar, intervaloMs);
    return () => clearInterval(id);
  }, [ativo, intervaloMs, recarregar]);

  return { dados, erro, atualizadoEm, recarregar };
}
