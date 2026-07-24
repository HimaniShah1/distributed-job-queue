import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  }

  return (
    <Button variant="outline" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
      {isDark ? (
        <Sun className="size-4" strokeWidth={1.75} />
      ) : (
        <Moon className="size-4" strokeWidth={1.75} />
      )}
    </Button>
  );
}
