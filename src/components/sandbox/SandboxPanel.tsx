import { useEffect, useState } from 'react';
import { useSimulation } from '../../hooks/useSimulation';
import { SimulationLog } from './SimulationLog';

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  idle: { bg: 'rgba(255,255,255,0.05)', color: 'var(--color-text-3)' },
  running: { bg: 'rgba(245,158,11,0.12)', color: 'var(--color-warning)' },
  complete: { bg: 'rgba(16,185,129,0.12)', color: 'var(--color-success)' },
  error: { bg: 'rgba(239,68,68,0.12)', color: 'var(--color-error)' },
};

const STATUS_LABEL: Record<string, string> = {
  idle: 'Idle',
  running: 'Running',
  complete: 'Complete',
  error: 'Error',
};

export function SandboxPanel() {
  const { runSimulation, status, result, isOpen, toggle } = useSimulation();
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    if (status === 'running') {
      setProgressKey(k => k + 1);
    }
  }, [status]);

  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.idle;

  return (
    <div
      style={{
        height: isOpen ? '300px' : '44px',
        transition: 'height 0.2s ease',
        background: 'var(--color-bg-2)',
        borderTop: '1px solid var(--color-border-1)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '44px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: isOpen ? '1px solid var(--color-border-1)' : 'none',
          background: 'var(--color-bg-0)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span style={{ fontSize: '16px' }}>🧪</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-1)' }}>Workflow Simulator</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              padding: '3px 10px',
              borderRadius: '999px',
              background: badge.bg,
              color: badge.color,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {status === 'running' ? <span className="anim-spin" style={{ display: 'inline-block' }}>⟳</span> : null}
            {STATUS_LABEL[status]}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button type="button" className="btn btn-primary" disabled={status === 'running'} onClick={() => void runSimulation()}>
            {status === 'running' ? '⟳ Running…' : '▶ Run Simulation'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={toggle} style={{ minWidth: '36px' }} aria-label="Toggle panel">
            {isOpen ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', minHeight: 0 }}>
          {status === 'idle' ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                gap: '8px',
                padding: '24px',
              }}
            >
              <span style={{ fontSize: '40px', color: 'var(--color-text-4)' }}>▶</span>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-2)' }}>
                Run simulation to validate and execute your workflow
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-4)', maxWidth: '360px', lineHeight: 1.5 }}>
                Validates graph structure → executes step by step
              </p>
            </div>
          ) : null}

          {status === 'running' ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: '16px',
                padding: '24px',
              }}
            >
              <span className="anim-spin" style={{ fontSize: '36px', color: 'var(--color-warning)' }}>
                ⟳
              </span>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-warning)' }}>Executing workflow…</p>
              <div
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  height: '4px',
                  borderRadius: '4px',
                  background: 'var(--color-border-1)',
                  overflow: 'hidden',
                }}
              >
                <div
                  key={progressKey}
                  className="sim-progress-bar"
                  style={{ height: '100%', borderRadius: '4px', background: 'var(--color-brand)' }}
                />
              </div>
            </div>
          ) : null}

          {(status === 'complete' || status === 'error') && result ? <SimulationLog result={result} /> : null}
        </div>
      ) : null}
    </div>
  );
}
