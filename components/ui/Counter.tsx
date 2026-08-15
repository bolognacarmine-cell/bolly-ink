import { useCounter } from '@/hooks/useCounter';

interface CounterProps {
  end: number;
  duration?: number;
  start?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function Counter({ 
  end, 
  duration = 2000, 
  start = 0, 
  decimals = 0,
  suffix = '',
  prefix = '',
  className = ''
}: CounterProps) {
  const { count, ref } = useCounter({ end, duration, start, decimals });

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}
