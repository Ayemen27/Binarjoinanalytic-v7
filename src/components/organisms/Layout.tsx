import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import { Sidebar } from '@/components/organisms/Sidebar';
import { useAuth } from '@/providers/AuthProvider';

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showNavbar = true,
  showFooter = true,
  showSidebar = false,
  sidebarOpen = false,
  onSidebarToggle,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Determine if we're on a dashboard page
  const isDashboard = router.pathname.startsWith('/dashboard');
  const shouldShowSidebar = showSidebar || (isDashboard && user);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Layout Structure */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        {shouldShowSidebar && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: sidebarOpen ? 0 : -300 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border lg:relative lg:translate-x-0"
          >
            <Sidebar />
          </motion.aside>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Navigation */}
          {showNavbar && (
            <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
              <Navbar 
                onSidebarToggle={onSidebarToggle}
                showSidebarToggle={shouldShowSidebar}
              />
            </header>
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </main>

          {/* Footer */}
          {showFooter && !isDashboard && (
            <Footer />
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {shouldShowSidebar && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onSidebarToggle}
        />
      )}
    </div>
  );
};