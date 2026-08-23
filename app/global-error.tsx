'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ backgroundColor: '#0B0F17', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <h2>Algo deu errado globalmente!</h2>
        <button
          onClick={() => reset()}
          style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', backgroundColor: '#06B6D4', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
        >
          Recarregar
        </button>
      </body>
    </html>
  );
}
