interface PayloadPreviewProps {
  payload: unknown;
}

export function PayloadPreview({ payload }: PayloadPreviewProps) {
  return (
    <div
      style={{
        marginTop: 20,
        padding: 12,
        borderRadius: 8,
        background: 'rgba(124, 58, 237, 0.05)',
        border: '1px solid rgba(124, 58, 237, 0.1)',
      }}
    >
      <p
        style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        Payload preview
      </p>
      <pre
        style={{
          fontSize: '0.75rem',
          color: 'var(--color-text-secondary)',
          whiteSpace: 'pre-wrap',
          fontFamily: 'JetBrains Mono, monospace',
          margin: 0,
        }}
      >
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}
