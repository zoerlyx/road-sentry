import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

export const AnimatedCounter = ({ target, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });
  const animatedRef = useRef(false);

  useEffect(() => {
    if (inView && !animatedRef.current) {
      animatedRef.current = true;
      let start = 0;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, target, duration]);

  return <span ref={ref}>{count}</span>;
};