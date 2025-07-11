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

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="h-8 px-3"
    >
      <currentTheme.icon className="h-4 w-4 mr-1" />
      <span className="text-xs font-medium">{currentTheme.label}</span>
    </Button>
  );
};