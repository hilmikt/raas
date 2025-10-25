'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

type AppFrameProps = {
  children: ReactNode;
};

export function AppFrame({ children }: AppFrameProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300 ease-out">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={isMounted ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          className="flex min-h-screen flex-col"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
