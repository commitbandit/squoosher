"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/react";

import { SidebarProvider } from "@/contexts/sidebar-context";
import { SolanaWalletProvider } from "@/providers/solana-wallet-provider";
import { PayerProvider } from "@/contexts/payer-context";

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
    <SolanaWalletProvider>
      <PayerProvider>
        <HeroUIProvider navigate={router.push}>
          <NextThemesProvider {...themeProps}>
            <ToastProvider />
            <SidebarProvider>{children}</SidebarProvider>
          </NextThemesProvider>
        </HeroUIProvider>
      </PayerProvider>
    </SolanaWalletProvider>
  );
}
