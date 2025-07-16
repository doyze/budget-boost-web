import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MonthYearSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label?: string;
  placeholder?: string;
  width?: string;
  icon?: React.ReactNode;
  formatOption?: (option: string) => string;
  ariaLabel?: string;
}

const MonthYearSelector = ({
  value,
  onChange,
  options,
  label,
  placeholder,
  width = 'w-full sm:w-48',
  icon = <Calendar className="h-4 w-4 mr-2" />,
  formatOption = (option: string) => format(new Date(option + '-01'), 'MMMM yyyy', { locale: th }),
  ariaLabel,
}: MonthYearSelectorProps) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Select value={value} onValueChange={onChange} aria-label={ariaLabel}>
        <SelectTrigger className={width}>
          {icon}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option} value={option}>
              {formatOption(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MonthYearSelector;