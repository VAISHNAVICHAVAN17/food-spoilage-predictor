// src/components/CountdownTimer.jsx
import React, { useState, useEffect, useRef } from 'react';

function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState('');
  const ref = useRef();

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return clearInterval(ref.current);
      const days = Math.floor(diff / (1000*60*60*24));
      setTimeLeft(`${days} day${days !== 1 ? 's' : ''} remaining`);
    };
    tick();
    ref.current = setInterval(tick, 1000*60*60*24);
    return () => clearInterval(ref.current);
  }, [targetDate]);

  return <p className="text-muted">{timeLeft}</p>;
}

export default CountdownTimer;
