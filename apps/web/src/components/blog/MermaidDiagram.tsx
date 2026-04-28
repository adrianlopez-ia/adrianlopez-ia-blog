import { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
  caption?: string;
}

export function MermaidDiagram({ chart, caption }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const mermaidConfig = {
      startOnLoad: false,
      theme: 'dark' as const,
      themeVariables: {
        primaryColor: '#6d28d9',
        primaryTextColor: '#f5f5f5',
        primaryBorderColor: '#7c3aed',
        lineColor: '#a78bfa',
        secondaryColor: '#1e1b4b',
        tertiaryColor: '#312e81',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
      },
      flowchart: { curve: 'monotoneX' as const, padding: 20 },
      sequence: { mirrorActors: false },
    };

    const initMermaid = async () => {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize(mermaidConfig);
      return mermaid;
    };

    const performRender = async (mermaid: any, chart: string) => {
      const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
      const { svg } = await mermaid.render(id, chart.trim());
      return svg;
    };

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Simplified as much as possible
    const render = async () => {
      try {
        const mermaid = await initMermaid();
        const svg = await performRender(mermaid, chart);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <div
        style={{
          padding: '1rem',
          background: '#1e1b4b',
          borderRadius: '0.75rem',
          color: '#f87171',
          fontSize: '0.875rem',
        }}
      >
        Diagram render error: {error}
      </div>
    );
  }

  return (
    <figure style={{ margin: '2rem 0' }}>
      <div
        ref={containerRef}
        style={{
          background: 'linear-gradient(135deg, #0f0a1a 0%, #1a1145 100%)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          overflow: 'auto',
          border: '1px solid rgba(124, 58, 237, 0.2)',
        }}
      />
      {caption && (
        <figcaption
          style={{
            textAlign: 'center',
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: '#a1a1aa',
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
