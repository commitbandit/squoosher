"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import Image from "next/image";

import { MenuIcon, CloseIcon } from "./icons";
import { WalletModal } from "./wallet-modal";

import { useSidebar } from "@/contexts/sidebar-context";

export const Header = () => {
  const { isOpen, toggleSidebar, isMobile } = useSidebar();

  return (
    <HeroUINavbar
      className="bg-white border-b border-b-divider sticky top-0 z-50"
      maxWidth="full"
      position="static"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        {isMobile && (
          <Button
            isIconOnly
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            className="mr-2"
            color="secondary"
            size="sm"
            variant="light"
            onPress={toggleSidebar}
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </Button>
        )}
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Image
              alt="Squoosher Logo"
              height={32}
              src="/squoosher.webp"
              width={32}
            />
            {!isMobile && (
              <p className="text-2xl tracking-tight inline font-bold font-rubikDoodleShadow">
                Squoosher
              </p>
            )}
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="basis-1 pl-4" justify="end">
        <WalletModal />
      </NavbarContent>
    </HeroUINavbar>
  );
};
