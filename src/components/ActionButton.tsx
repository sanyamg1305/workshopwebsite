import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';

interface ActionButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label: string;
  microtext?: string;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  label,
  microtext,
  variant = 'primary',
  type = 'button',
  className = '',
}) => {
  const isPrimary = variant === 'primary';
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          group relative w-full py-4 px-8 rounded-2xl font-black text-xl 
          transition-all duration-300 flex items-center justify-center gap-3
          ${isPrimary 
            ? 'bg-primary text-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]' 
            : 'bg-section text-white border border-border hover:bg-section-alt hover:border-primary/50'
          }
          ${(disabled || loading) ? 'opacity-50 cursor-not-allowed grayscale-[0.5]' : ''}
        `}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          <>
            {label}
            <ArrowRight className="transition-transform group-hover:translate-x-1" size={24} />
          </>
        )}
      </button>
      
      {microtext && (
        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary text-center italic opacity-60">
          {microtext}
        </p>
      )}
      
      {disabled && !loading && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold py-1 px-3 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-border">
          Complete all required fields to continue
        </div>
      )}
    </div>
  );
};
