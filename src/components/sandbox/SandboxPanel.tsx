import { useEffect, useState } from 'react';
import { useSimulation } from '../../hooks/useSimulation';
import { SimulationLog } from './SimulationLog';

const STATUS_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  idle: {
    bg: 'rgba(255,255,255,0.03)',
    color: 'var(--color-text-3)',
    border: 'var(--color-border-1)',
  },
  running: {
    bg: 'rgba(139,92,246,0.16)',
    color: 'var(--color-accent)',
    border: 'rgba(139,92,246,0.4)',
  },
  complete: {
    bg: 'rgba(34,197,94,0.16)',
    color: 'var(--color-success)',
    border: 'rgba(34,197,94,0.36)',
  },
  error: {
    bg: 'rgba(248,113,113,0.16)',
    color: 'var(--color-error)',
    border: 'rgba(248,113,113,0.36)',
  },
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
      className="wf-sandbox"
      style={{
        height: isOpen ? '300px' : '46px',
        transition: 'height 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '46px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: isOpen ? '1px solid var(--color-border-1)' : 'none',
          background: 'rgba(10, 14, 22, 0.62)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span style={{ fontSize: '15px', color: 'var(--color-accent)' }}>◉</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-1)' }}>Workflow Simulator</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: '999px',
              background: badge.bg,
              border: `1px solid ${badge.border}`,
              color: badge.color,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {status === 'running' ? (
              <span className="anim-spin" style={{ display: 'inline-block' }}>
                ⟳
              </span>
            ) : null}
            {STATUS_LABEL[status]}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button type="button" className="btn btn-primary" disabled={status === 'running'} onClick={() => void runSimulation()}>
            {status === 'running' ? '⟳ Running…' : '▶ Run Simulation'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={toggle}
            style={{ minWidth: '36px' }}
            aria-label="Toggle panel"
          >
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
              <span className="anim-spin" style={{ fontSize: '36px', color: 'var(--color-accent)' }}>
                ⟳
              </span>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-accent)' }}>Executing workflow…</p>
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
                  style={{
                    height: '100%',
                    borderRadius: '4px',
                    background: 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 60%, #a78bfa 100%)',
                  }}
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
