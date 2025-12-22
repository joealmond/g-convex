'use client';

import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { DynamicHeaderButtons } from './dynamic-header-buttons';
import { AdminToolbar } from './admin-toolbar';

function AppLayoutContent({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:px-6 z-40">
        <nav className="flex items-center w-full text-lg font-medium">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold"
          >
             <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary h-6 w-6"
              >
                <path
                  d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 7L12 12L22 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12V22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            <span className="sr-only">G-Matrix</span>
          </Link>
          <div className="flex-1" />
           <DynamicHeaderButtons />
        </nav>
      </header>
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        {children}
      </main>
    </div>
  );
}


export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppLayoutContent>{children}</AppLayoutContent>
      <AdminToolbar />
    </>
  );
}
