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
      text-sm font-medium transition-all duration-200 focus-visible:outline-none 
      focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
      disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]
      relative overflow-hidden
    `;

    const variants = {
      primary: `
        bg-primary text-primary-foreground hover:bg-primary/90 
        shadow-md hover:shadow-lg active:shadow-sm
      `,
      secondary: `
        bg-secondary text-secondary-foreground hover:bg-secondary/80
        border border-secondary-foreground/20
      `,
      outline: `
        border border-input bg-background hover:bg-accent 
        hover:text-accent-foreground hover:border-accent-foreground/50
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