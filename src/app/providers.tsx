"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/react";
import { QueryClientProvider } from "@tanstack/react-query";

import { SidebarProvider } from "@/contexts/sidebar-context";
import { SolanaWalletProvider } from "@/providers/solana-wallet-provider";
import { WalletProvider } from "@/contexts/wallet-context";
import queryClient from "@/config/queryClient";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <QueryClientProvider client={queryClient}>
      <SolanaWalletProvider>
        <WalletProvider>
          <HeroUIProvider navigate={router.push}>
            <NextThemesProvider {...themeProps}>
              <ToastProvider />
              <SidebarProvider>{children}</SidebarProvider>
            </NextThemesProvider>
          </HeroUIProvider>
        </WalletProvider>
      </SolanaWalletProvider>
    </QueryClientProvider>
  );
}
