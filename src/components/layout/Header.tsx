
import React from 'react';
import { Link } from 'react-router-dom';
import { ChartLine, BookOpen, PieChart, Menu, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import ThemeToggle from '@/components/ThemeToggle';

const Header = () => {
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="font-bold text-2xl text-tradezella-primary flex items-center">
            <ChartLine className="mr-2" size={28} />
            <span>TradeZella</span>
          </Link>
        </div>

        {!isMobile ? (
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-tradezella-primary font-medium">Dashboard</Link>
            <Link to="/journal" className="text-foreground hover:text-tradezella-primary font-medium">Journal</Link>
            <Link to="/playbooks" className="text-foreground hover:text-tradezella-primary font-medium">Playbooks</Link>
            <Link to="/notes" className="text-foreground hover:text-tradezella-primary font-medium">Notes</Link>
          </nav>
        ) : (
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {showMobileMenu ? <X /> : <Menu />}
          </Button>
        )}

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Avatar className="cursor-pointer">
            <AvatarFallback className="bg-tradezella-primary text-white">TZ</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && showMobileMenu && (
        <div className="md:hidden bg-background py-4 px-4 shadow-lg absolute top-16 left-0 right-0 z-40">
          <nav className="flex flex-col space-y-4">
            <Link to="/" className="flex items-center text-foreground hover:text-tradezella-primary font-medium p-2" onClick={toggleMobileMenu}>
              <PieChart size={20} className="mr-2" />
              Dashboard
            </Link>
            <Link to="/journal" className="flex items-center text-foreground hover:text-tradezella-primary font-medium p-2" onClick={toggleMobileMenu}>
              <BookOpen size={20} className="mr-2" />
              Journal
            </Link>
            <Link to="/playbooks" className="flex items-center text-foreground hover:text-tradezella-primary font-medium p-2" onClick={toggleMobileMenu}>
              <ChartLine size={20} className="mr-2" />
              Playbooks
            </Link>
            <Link to="/notes" className="flex items-center text-foreground hover:text-tradezella-primary font-medium p-2" onClick={toggleMobileMenu}>
              <FileText size={20} className="mr-2" />
              Notes
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
