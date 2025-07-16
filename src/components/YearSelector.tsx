import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface YearSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options: number[];
  label?: string;
  placeholder?: string;
  width?: string;
  icon?: React.ReactNode;
  ariaLabel?: string;
}

const YearSelector = ({
  value,
  onChange,
  options,
  label,
  placeholder,
  width = 'w-full sm:w-32',
  icon,
  ariaLabel,
}: YearSelectorProps) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Select 
        value={value.toString()} 
        onValueChange={(value) => onChange(parseInt(value))} 
        aria-label={ariaLabel}
      >
        <SelectTrigger className={width}>
          {icon}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default YearSelector;