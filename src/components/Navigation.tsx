import { NavLink } from 'react-router-dom';
import { Home, Plus, Settings, BarChart3, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ThemeSelector } from '@/components/ThemeSelector';

const Navigation = () => {
  const { user, profile, signOut } = useAuth();
  
  console.log('Navigation rendered, user:', user);
  
  const navItems = [
    { to: '/', icon: Home, label: 'หน้าหลัก' },
    { to: '/add', icon: Plus, label: 'เพิ่มรายการ' },
    { to: '/categories', icon: Settings, label: 'จัดการหมวดหมู่' },
  ];

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-lg md:text-xl font-bold text-foreground">
              <span className="hidden sm:block">จัดการรายรับรายจ่าย</span>
            </h1>
          </NavLink>
          
          <div className="hidden md:flex items-center space-x-4">
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
                <span className="hidden sm:block">{label}</span>
              </NavLink>
            ))}
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-center p-2 rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )
                }
              >
                <Icon className="h-5 w-5" />
              </NavLink>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">สวัสดี</span>
                  <span className="font-medium">
                    {profile?.first_name || user.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">ออกจากระบบ</span>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/auth'}
                className="hidden sm:flex"
              >
                <User className="h-4 w-4 mr-2" />
                เข้าสู่ระบบ
              </Button>
            )}
            
            <ThemeSelector />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;