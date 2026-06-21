import React, { useMemo } from 'react';

const FloatingParticles = ({ count = 50, color = 'rgba(255, 255, 255, 0.7)' }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2, // 2px to 6px
      left: Math.random() * 100, // 0% to 100%
      top: Math.random() * 100, // 0% to 100%
      animationDuration: Math.random() * 15 + 10, // 10s to 25s
      animationDelay: Math.random() * 10, // 0s to 10s
      opacity: Math.random() * 0.6 + 0.2, // 0.2 to 0.8
      direction: Math.random() > 0.5 ? 1 : -1,
      animationType: Math.random() > 0.5 ? 'animate-fly' : 'animate-fly-reverse'
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${p.animationType} animate-blink`}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            backgroundColor: color,
            boxShadow: `0 0 ${p.size * 2}px ${color}`,
            opacity: p.opacity,
            animationDuration: `${p.animationDuration}s, 4s`,
            animationDelay: `-${p.animationDelay}s, -${p.animationDelay / 2}s`,
            transform: `scale(${p.direction})`
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
