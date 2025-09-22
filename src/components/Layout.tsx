import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';
import { Brain, Settings, Users, MessageCircle, Home, User, Calendar } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  className?: string;
}

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/matches', label: 'Matches', icon: Users },
  { path: '/daily', label: 'Daily', icon: Calendar },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showNav = true,
  className 
}) => {
  const location = useLocation();
  
  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('neuromatch_user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const currentUser = getCurrentUser();

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Navigation Header */}
      {showNav && (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border shadow-soft">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground">
                NeuroMatch
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Avatar */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <Link to="/profile" className="hover:opacity-80 transition-opacity">
                  <Avatar
                    username={currentUser.username}
                    size="sm"
                    gradient="from-primary to-primary-light"
                  />
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Mobile Navigation */}
      {showNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-large">
          <div className="flex items-center justify-around py-2">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200',
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Mobile navigation padding */}
      {showNav && <div className="h-20 md:hidden" />}
    </div>
  );
};

// Loading Layout Component
interface LoadingLayoutProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const LoadingLayout: React.FC<LoadingLayoutProps> = ({
  title = "Processing...",
  description = "This will just take a moment",
  children
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Animated Brain Icon */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto gradient-primary rounded-full flex items-center justify-center animate-pulse-soft">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-primary/20 rounded-full animate-pulse" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Custom content */}
        {children}
      </div>
    </div>
  );
};