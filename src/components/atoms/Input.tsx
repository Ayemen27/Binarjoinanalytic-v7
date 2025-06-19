import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      inputSize = 'md',
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    
    const inputType = type === 'password' && showPassword ? 'text' : type;
    const hasError = !!error;
    
    const baseStyles = `
      flex w-full rounded-md border bg-background text-sm 
      ring-offset-background transition-all duration-200
      file:border-0 file:bg-transparent file:text-sm file:font-medium 
      placeholder:text-muted-foreground 
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
      focus-visible:ring-offset-2 
      disabled:cursor-not-allowed disabled:opacity-50
    `;

    const variants = {
      default: `
        border-input hover:border-ring/50
        ${hasError ? 'border-destructive focus-visible:ring-destructive' : ''}
      `,
      filled: `
        border-transparent bg-muted hover:bg-muted/80
        ${hasError ? 'bg-destructive/10 hover:bg-destructive/20' : ''}
      `,
      outline: `
        border-2 border-input hover:border-ring/50
        ${hasError ? 'border-destructive focus-visible:ring-destructive' : ''}
      `,
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-3 py-2',
      lg: 'h-12 px-4 text-base',
    };

    const containerPadding = {
      sm: leftIcon ? 'pl-9' : rightIcon || type === 'password' ? 'pr-9' : '',
      md: leftIcon ? 'pl-10' : rightIcon || type === 'password' ? 'pr-10' : '',
      lg: leftIcon ? 'pl-12' : rightIcon || type === 'password' ? 'pr-12' : '',
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <motion.label
            className={cn(
              'text-sm font-medium leading-none mb-2 block transition-colors',
              hasError ? 'text-destructive' : 'text-foreground',
              disabled && 'opacity-50'
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
              isFocused && 'text-ring',
              hasError && 'text-destructive'
            )}>
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <motion.input
            ref={ref}
            type={inputType}
            className={cn(
              baseStyles,
              variants[variant],
              sizes[inputSize],
              containerPadding[inputSize],
              className
            )}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.1 }}
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          {(rightIcon || type === 'password') && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {type === 'password' ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    'text-muted-foreground hover:text-foreground transition-colors',
                    'focus:outline-none focus:text-ring'
                  )}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <div className={cn(
                  'text-muted-foreground',
                  isFocused && 'text-ring',
                  hasError && 'text-destructive'
                )}>
                  {rightIcon}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Helper Text or Error */}
        {(helperText || error) && (
          <motion.p
            className={cn(
              'text-xs mt-1.5',
              hasError ? 'text-destructive' : 'text-muted-foreground'
            )}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error || helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };