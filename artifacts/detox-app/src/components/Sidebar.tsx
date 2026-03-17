import { Link, useLocation } from "wouter";
import { Home, ListTodo, Settings2, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/questions", label: "Questions", icon: ListTodo },
    { href: "/settings", label: "Settings", icon: Settings2 },
  ];

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-full hidden md:flex">
      <div className="h-20 flex items-center px-8 border-b border-border">
        <div className="flex items-center space-x-3 text-primary">
          <Leaf className="w-6 h-6" />
          <span className="font-display font-bold text-xl tracking-tight text-foreground">Detox</span>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href} className="block">
              <div className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
                <link.icon className={cn("w-5 h-5", isActive ? "text-primary" : "opacity-70 group-hover:opacity-100")} />
                <span>{link.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-border">
        <div className="bg-secondary rounded-xl p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            "Almost everything will work again if you unplug it for a few minutes, including you."
          </p>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [location] = useLocation();
  const links = [
    { href: "/", icon: Home },
    { href: "/questions", icon: ListTodo },
    { href: "/settings", icon: Settings2 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-sidebar border-t border-border z-50 flex items-center justify-around px-6">
      {links.map((link) => {
        const isActive = location === link.href;
        return (
          <Link key={link.href} href={link.href} className="block p-2">
            <div className={cn(
              "p-3 rounded-full transition-all",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}>
              <link.icon className="w-6 h-6" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
