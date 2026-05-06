import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NavLink = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/lunalogo.jpeg"
            alt="Luna Studies"
            className="h-10 w-10 object-contain"
          />
          <span className="font-serif text-2xl font-semibold">
            Luna Studies
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/subjects" className="hover:text-foreground transition-colors">
            Subjects
          </Link>
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#security" className="hover:text-foreground transition-colors">
            Security
          </a>
        </nav>

        {/* Right buttons */}
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button>Get started</Button>
          </Link>
        </div>

      </div>
    </header>
  );
};

NavLink.displayName = "NavLink";

export default NavLink;

