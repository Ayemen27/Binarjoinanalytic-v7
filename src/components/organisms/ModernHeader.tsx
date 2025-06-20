import React from 'react';
import { motion } from 'framer-motion';

interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  gradient?: boolean;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  subtitle,
  children,
  gradient = false
}) => {
  return (
    <div className="relative mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
          gradient 
            ? 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent' 
            : 'text-foreground'
        }`}>
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ModernHeader;