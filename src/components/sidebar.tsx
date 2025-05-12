"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSidebar } from "@/contexts/sidebar-context";
import { siteConfig } from "@/config/site";

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar, isMobile } = useSidebar();

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 w-full h-full border-0 cursor-default"
          tabIndex={0}
          type="button"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`${
          isMobile
            ? `fixed left-0 top-0 pt-16 z-40 h-full w-64 transform transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "w-64 flex-shrink-0 h-full pt-0"
        } border-r bg-white`}
      >
        <div className="p-4">
          <nav className="space-y-1">
            {siteConfig.menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  className={`block p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-secondary-50 text-secondary-600 font-medium"
                      : "hover:bg-gray-50"
                  }`}
                  href={item.href}
                  onClick={() => isMobile && closeSidebar()}
                >
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.shortDescription}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
