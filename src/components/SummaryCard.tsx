import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MouseEventHandler } from 'react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  color?: 'green' | 'red' | 'blue' | 'default' | 'dynamic';
  subtitle?: string;
  formatter?: (value: number) => string;
  account_id?: string;
  onIconClick?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const SummaryCard = ({
  title,
  value,
  icon,
  color = 'default',
  subtitle,
  formatter = (val) => typeof val === 'number' ? `฿${val.toLocaleString()}` : val.toString(),
  account_id,
  onIconClick,
  onClick,
}: SummaryCardProps) => {
  const getColorClass = () => {
    switch (color) {
      case 'green':
        return 'text-green-600';
      case 'red':
        return 'text-red-600';
      case 'blue':
        return 'text-blue-600';
      case 'dynamic':
        return typeof value === 'number' && value >= 0 ? 'text-green-600' : 'text-red-600';
      default:
        return '';
    }
  };

  const formattedValue = typeof value === 'number' ? formatter(value) : value;

  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:bg-muted/50' : ''} relative`}
      onClick={onClick}
    >
      {icon && (
        <div 
          className={`${getColorClass()} ${onIconClick ? 'cursor-pointer hover:opacity-80' : ''} absolute top-1/2 right-4 transform -translate-y-1/2 z-10`} 
          onClick={(e) => {
            if (onIconClick) {
              e.stopPropagation();
              onIconClick(e);
            }
          }}
          title={onIconClick ? 'คลิกเพื่อดูรายละเอียด' : undefined}
        >
          {icon}
        </div>
      )}
      <CardHeader className="flex flex-row items-center space-y-0 pb-2 pr-16">
        <CardTitle className={`text-sm font-medium ${color !== 'default' ? getColorClass() : ''}`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-xl md:text-2xl font-bold ${getColorClass()}`}>
          {formattedValue}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;