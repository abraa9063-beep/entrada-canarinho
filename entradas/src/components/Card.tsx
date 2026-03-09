import { HTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', children, ...props }, ref) => {
    const paddingStyles = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'card',
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Stat Card
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'red' | 'green' | 'purple' | 'cyan' | 'orange';
  subtitle?: string;
}

export function StatCard({ title, value, icon, color = 'blue', subtitle }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={'stat-card-icon ' + color}>
        {icon}
      </div>
      <p className="stat-card-title">{title}</p>
      <p className="stat-card-value">{value}</p>
      {subtitle && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
