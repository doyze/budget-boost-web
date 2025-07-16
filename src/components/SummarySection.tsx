import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface SummarySectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  tag?: string;
}

const SummarySection = ({
  title,
  children,
  className = '',
  action,
  tag,
}: SummarySectionProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {tag && (
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {tag}
            </span>
          )}
        </div>
        {action}
      </div>
      <Separator className="my-2" />
      <Card className="p-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {children}
        </div>
      </Card>
    </div>
  );
};

export default SummarySection;