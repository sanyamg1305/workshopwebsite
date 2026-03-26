import React, { useState, useEffect, forwardRef, ComponentPropsWithRef } from 'react';

interface Props extends ComponentPropsWithRef<'input'> {
  onDebounce: (value: string) => void;
  debounceTime?: number;
}

export const DebouncedInput = forwardRef<HTMLInputElement, Props>(({ value, onDebounce, debounceTime = 800, ...props }, ref) => {
  const [localValue, setLocalValue] = useState(value as string || '');

  useEffect(() => {
    setLocalValue(value as string || '');
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onDebounce(localValue);
      }
    }, debounceTime);
    return () => clearTimeout(timer);
  }, [localValue, onDebounce, debounceTime, value]);

  return (
    <input
      {...props}
      ref={ref}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
});

interface TextareaProps extends ComponentPropsWithRef<'textarea'> {
  onDebounce: (value: string) => void;
  debounceTime?: number;
}

export const DebouncedTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ value, onDebounce, debounceTime = 800, ...props }, ref) => {
  const [localValue, setLocalValue] = useState(value as string || '');

  useEffect(() => {
    setLocalValue(value as string || '');
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onDebounce(localValue);
      }
    }, debounceTime);
    return () => clearTimeout(timer);
  }, [localValue, onDebounce, debounceTime, value]);

  return (
    <textarea
      {...props}
      ref={ref}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
});
