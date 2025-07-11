import React from 'react';
import { Sun, Droplets, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'blue', icon: Droplets, label: 'Blue' },
    { value: 'dark', icon: Moon, label: 'Dark' },
  ] as const;

  return (
    <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant={theme === value ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme(value)}
          className={`h-8 px-3 ${
            theme === value 
              ? 'bg-background text-foreground shadow-sm' 
              : 'hover:bg-background/80'
          }`}
        >
          <Icon className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">{label}</span>
        </Button>
      ))}
    </div>
  );
};