import { Search, RefreshCw, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from './ThemeToggle';

const TIME_RANGES = ['Last hour', 'Last 24 hours', 'Last 7 days', 'Last 30 days'];

export function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 lg:px-6">
      <div className="relative w-full max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
        />
        <Input placeholder="Search" className="pr-12 pl-8" />
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" className="gap-2" />}>
            <RefreshCw className="size-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Auto sync</span>
            <span className="flex items-center gap-1 text-success">
              <span className="size-1.5 rounded-full bg-success" />
              On
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>On</DropdownMenuItem>
            <DropdownMenuItem>Off</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" className="gap-2" />}>
            <Calendar className="size-4" strokeWidth={1.75} />
            <span>Last 24 hours</span>
            <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {TIME_RANGES.map((range) => (
              <DropdownMenuItem key={range}>{range}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 px-2" />}>
            <Avatar size="sm">
              <AvatarFallback className="bg-secondary text-foreground">JP</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm text-foreground sm:inline">Jaylon Philips</span>
            <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
