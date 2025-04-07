"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Database,
  LineChart,
  FileCode,
  BarChart2,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Camera,
  Bell
} from "lucide-react";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const SidebarLink = ({ href, icon, label, active }: SidebarLinkProps) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-30 bg-primary text-primary-foreground p-2 rounded-md shadow-md"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-20 w-64 bg-card border-r border-border transition-transform transform 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static flex flex-col h-screen
      `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
          <div className="relative w-8 h-8">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="text-primary w-8 h-8"
            >
              <path
                d="M17 14C18.6569 14 20 12.6569 20 11C20 9.34315 18.6569 8 17 8C15.3431 8 14 9.34315 14 11C14 12.6569 15.3431 14 17 14Z"
                fill="currentColor"
              />
              <path
                d="M4 14.0001C5.65685 14.0001 7 12.6569 7 11.0001C7 9.34324 5.65685 8.00009 4 8.00009C2.34315 8.00009 1 9.34324 1 11.0001C1 12.6569 2.34315 14.0001 4 14.0001Z"
                fill="currentColor"
              />
              <path
                d="M10.5 22.0001C12.1569 22.0001 13.5 20.6569 13.5 19.0001C13.5 17.3432 12.1569 16.0001 10.5 16.0001C8.84315 16.0001 7.5 17.3432 7.5 19.0001C7.5 20.6569 8.84315 22.0001 10.5 22.0001Z"
                fill="currentColor"
              />
              <path
                d="M18.5 19.0001C20.1569 19.0001 21.5 17.6569 21.5 16.0001C21.5 14.3432 20.1569 13.0001 18.5 13.0001C16.8431 13.0001 15.5 14.3432 15.5 16.0001C15.5 17.6569 16.8431 19.0001 18.5 19.0001Z"
                fill="currentColor"
              />
              <path
                d="M7.5 6.00009C9.15685 6.00009 10.5 4.65694 10.5 3.00009C10.5 1.34324 9.15685 9.15527e-05 7.5 9.15527e-05C5.84315 9.15527e-05 4.5 1.34324 4.5 3.00009C4.5 4.65694 5.84315 6.00009 7.5 6.00009Z"
                fill="currentColor"
              />
              <path
                d="M13.5 11.0001C15.1569 11.0001 16.5 9.65694 16.5 8.00009C16.5 6.34324 15.1569 5.00009 13.5 5.00009C11.8431 5.00009 10.5 6.34324 10.5 8.00009C10.5 9.65694 11.8431 11.0001 13.5 11.0001Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Elephant Detection
            </h1>
            <p className="text-xs text-muted-foreground">AI Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <SidebarLink
            href="/dashboard"
            icon={<Home size={18} />}
            label="Dashboard"
            active={pathname === "/dashboard"}
          />
          <SidebarLink
            href="/datasets"
            icon={<Database size={18} />}
            label="Datasets"
            active={pathname === "/datasets"}
          />
          <SidebarLink
            href="/training"
            icon={<LineChart size={18} />}
            label="Training"
            active={pathname === "/training"}
          />
          <SidebarLink
            href="/detection"
            icon={<Camera size={18} />}
            label="Live Detection"
            active={pathname === "/detection"}
          />
          <SidebarLink
            href="/notifications"
            icon={<Bell size={18} />}
            label="Notifications"
            active={pathname === "/notifications"}
          />
          <SidebarLink
            href="/inference"
            icon={<FileCode size={18} />}
            label="Inference"
            active={pathname === "/inference"}
          />
          <SidebarLink
            href="/logs"
            icon={<BarChart2 size={18} />}
            label="Logs & Metrics"
            active={pathname === "/logs"}
          />
          <SidebarLink
            href="/settings"
            icon={<Settings size={18} />}
            label="Settings"
            active={pathname === "/settings"}
          />
        </nav>

        {/* User Profile */}
        <div className="border-t border-border px-4 py-4">
          <Link href="/profile" className="block">
            <div className="flex items-center gap-3 mb-3 hover:bg-muted/50 p-2 rounded-md transition-colors">
              <div className="bg-muted p-2 rounded-full">
                <User size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@example.com</p>
              </div>
            </div>
          </Link>
          <Link
            href="/logout"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted/50"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </Link>
        </div>
      </div>
    </>
  );
}
