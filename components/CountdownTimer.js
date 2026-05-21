import { useState, useEffect } from 'react';

const STAGE2_DATE = new Date('2026-07-01T00:00:00Z');

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [expired, setExpired] = useState(false);

  function getTimeLeft() {
    const now = new Date();
    const diff = STAGE2_DATE - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const t = getTimeLeft();
      setTimeLeft(t);
      if (t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
        setExpired(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  const styles = {
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '24px',
      marginBottom: '8px',
    },
    card: {
      background: 'rgba(10, 20, 40, 0.85)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '12px',
      padding: '16px 28px',
      backdropFilter: 'blur(12px)',
      textAlign: 'center',
      maxWidth: '420px',
      width: '100%',
    },
    label: {
      fontSize: '11px',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '12px',
    },
    timerRow: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '4px',
    },
    unit: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: '56px',
    },
    number: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#ffffff',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: '1',
    },
    unitLabel: {
      fontSize: '10px',
      color: '#718096',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      marginTop: '4px',
    },
    divider: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#4a5568',
      paddingBottom: '8px',
    },
    sublabel: {
      color: '#718096',
      fontSize: '12px',
      margin: '10px 0 0',
    },
    expiredText: {
      color: '#e53e3e',
      fontWeight: '600',
      fontSize: '14px',
      margin: '0',
    },
  };

  if (expired) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <p style={styles.expiredText}>Stage 2 is now live &mdash; price: $0.20 / CLXT</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.label}>Stage 1 price locks in</div>
        <div style={styles.timerRow}>
          <div style={styles.unit}>
            <span style={styles.number}>{pad(timeLeft.days)}</span>
            <span style={styles.unitLabel}>Days</span>
          </div>
          <span style={styles.divider}>:</span>
          <div style={styles.unit}>
            <span style={styles.number}>{pad(timeLeft.hours)}</span>
            <span style={styles.unitLabel}>Hours</span>
          </div>
          <span style={styles.divider}>:</span>
          <div style={styles.unit}>
            <span style={styles.number}>{pad(timeLeft.minutes)}</span>
            <span style={styles.unitLabel}>Min</span>
          </div>
          <span style={styles.divider}>:</span>
          <div style={styles.unit}>
            <span style={styles.number}>{pad(timeLeft.seconds)}</span>
            <span style={styles.unitLabel}>Sec</span>
          </div>
        </div>
        <p style={styles.sublabel}>Stage 2 price: $0.20 / CLXT &mdash; double the current rate</p>
      </div>
    </div>
  );
}
