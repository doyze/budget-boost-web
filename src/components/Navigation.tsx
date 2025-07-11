import { NavLink } from 'react-router-dom';
import { Home, Plus, Settings, BarChart3, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const { theme, setTheme } = useTheme();
  
  const navItems = [
    { to: '/', icon: Home, label: 'หน้าหลัก' },
    { to: '/add', icon: Plus, label: 'เพิ่มรายการ' },
    { to: '/categories', icon: Settings, label: 'จัดการหมวดหมู่' },
  ];

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">จัดการรายรับรายจ่าย</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="ml-2"
              data-theme={theme}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">สลับธีม</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;