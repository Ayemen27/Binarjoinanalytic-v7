import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center whitespace-nowrap rounded-md 
      text-sm font-medium transition-all duration-300 focus-visible:outline-none 
      focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 
      disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96]
      relative overflow-hidden group
    `;

    const variants = {
      primary: `
        bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground 
        hover:from-primary/90 hover:to-primary shadow-soft hover:shadow-medium
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent 
        before:via-white/20 before:to-transparent before:translate-x-[-200%] 
        hover:before:translate-x-[200%] before:transition-transform before:duration-700
      `,
      secondary: `
        bg-gradient-to-br from-secondary to-secondary/90 text-secondary-foreground 
        hover:from-secondary/90 hover:to-secondary border border-secondary-foreground/20
        hover:border-secondary-foreground/30
      `,
      outline: `
        border border-input bg-background/50 backdrop-blur-sm hover:bg-accent/80 
        hover:text-accent-foreground hover:border-primary/50 hover:shadow-soft
      `,
      ghost: `
        hover:bg-accent hover:text-accent-foreground
      `,
      link: `
        text-primary underline-offset-4 hover:underline
      `,
      destructive: `
        bg-destructive text-destructive-foreground hover:bg-destructive/90
        shadow-md hover:shadow-lg active:shadow-sm
      `,
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8 text-base',
      icon: 'h-10 w-10',
    };

    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        
        {/* Left Icon */}
        {leftIcon && !loading && (
          <span className="mr-2 flex items-center">
            {leftIcon}
          </span>
        )}
        
        {/* Button Content */}
        {children}
        
        {/* Right Icon */}
        {rightIcon && (
          <span className="ml-2 flex items-center">
            {rightIcon}
          </span>
        )}
        
        {/* Ripple Effect */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-md opacity-0"
          whileTap={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };