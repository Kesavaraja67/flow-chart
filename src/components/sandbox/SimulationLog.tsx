import type { SimulationResult, SimulationStep } from '../../types/workflow';

interface Props {
  result: SimulationResult;
}

const STATUS_ICONS: Record<SimulationStep['status'], string> = {
  success: '✅',
  pending: '⏳',
  skipped: '⏭️',
  error: '❌',
};

const BADGE: Record<string, string> = {
  start: 'rgba(34,197,94,0.15)',
  task: 'rgba(56,189,248,0.15)',
  approval: 'rgba(245,158,11,0.15)',
  automated: 'rgba(139,92,246,0.18)',
  end: 'rgba(248,113,113,0.15)',
};

const BADGE_TEXT: Record<string, string> = {
  start: 'var(--color-start)',
  task: 'var(--color-task)',
  approval: 'var(--color-approval)',
  automated: 'var(--color-automated)',
  end: 'var(--color-end)',
};

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function SimulationLog({ result }: Props) {
  if (result.errors.length > 0) {
    return (
      <div
        style={{
          borderRadius: '10px',
          border: '1px solid rgba(248,113,113,0.4)',
          background: 'rgba(248,113,113,0.08)',
          padding: '16px',
        }}
      >
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-error)', marginBottom: '10px' }}>
          Validation Failed
        </p>
        {result.errors.map((err, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--color-error)',
              marginBottom: '6px',
            }}
          >
            <span>✗</span>
            <span>{err}</span>
          </div>
        ))}
      </div>
    );
  }

  const successCount = result.steps.filter(s => s.status === 'success').length;
  const pendingCount = result.steps.filter(s => s.status === 'pending').length;
  const skippedCount = result.steps.filter(s => s.status === 'skipped').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <div
        style={{
          marginBottom: '16px',
          padding: '12px 14px',
          borderRadius: '10px',
          border: '1px solid var(--color-border-1)',
          background: 'rgba(17,21,30,0.7)',
        }}
      >
        <p style={{ fontSize: '12px', color: 'var(--color-text-2)', lineHeight: 1.5 }}>
          {result.steps.length} steps · {successCount} succeeded · {pendingCount} pending · {skippedCount} skipped ·{' '}
          {result.totalDurationMs}ms
        </p>
        <p style={{ fontSize: '11px', color: 'var(--color-text-3)', marginTop: '6px' }}>{result.summary}</p>
      </div>

      <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '1px solid var(--color-border-1)' }}>
        {result.steps.map((step, idx) => {
          const bg = BADGE[step.nodeType] ?? 'var(--color-bg-3)';
          const fg = BADGE_TEXT[step.nodeType] ?? 'var(--color-text-2)';
          return (
            <div
              key={`${step.nodeId}-${step.stepNumber}`}
              className="step-item"
              style={{
                position: 'relative',
                marginBottom: idx === result.steps.length - 1 ? 0 : '16px',
                paddingLeft: '8px',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: '-26px',
                  top: '4px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'var(--color-bg-3)',
                  border: `2px solid ${fg}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--color-text-1)',
                }}
              >
                {step.stepNumber}
              </span>
              <div
                style={{
                  borderRadius: '10px',
                  border: '1px solid var(--color-border-2)',
                  background: 'var(--color-bg-3)',
                  boxShadow: 'var(--shadow-node)',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      border: `1px solid ${fg}55`,
                      background: bg,
                      color: fg,
                    }}
                  >
                    {step.nodeType}
                  </span>
                  <span style={{ fontSize: '14px' }}>{STATUS_ICONS[step.status]}</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-3)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {step.durationMs}ms
                  </span>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-1)', marginBottom: '6px' }}>
                  {step.nodeTitle}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-2)', lineHeight: 1.5 }}>{step.message}</p>
                <p
                  style={{
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: 'var(--color-text-3)',
                    marginTop: '8px',
                  }}
                >
                  {formatTime(step.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
