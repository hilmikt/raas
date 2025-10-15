'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const iconVariants = {
  enter: { opacity: 0, scale: 0.7, rotate: -20 },
  center: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0, scale: 0.7, rotate: 20 },
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
  const label = `Switch to ${nextTheme} mode`;

  return (
    <motion.button
      type="button"
      aria-label={label}
      className="focus-outline relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm transition hover:border-border"
      onClick={() => setTheme(nextTheme)}
      whileHover={{ scale: 1.05, rotate: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 ease-out hover:opacity-100" />
      <AnimatePresence mode="wait" initial={false}>
        {mounted ? (
          <motion.span
            key={resolvedTheme}
            variants={iconVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative flex items-center justify-center text-foreground"
          >
            {resolvedTheme === 'dark' ? (
              <Moon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Sun className="h-5 w-5" aria-hidden="true" />
            )}
          </motion.span>
        ) : (
          <Sun className="h-5 w-5 text-foreground" aria-hidden="true" />
        )}
      </AnimatePresence>
      <span className="sr-only">{label}</span>
    </motion.button>
  );
}
