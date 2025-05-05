export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Squoosher",
  description:
    "Compressed Token Minter: A simple interface for developers to launch their own Compressed Token.",
  links: {
    github: "https://github.com/commitbandit/squoosher",
    twitter: "https://twitter.com/squoosher",
  },
  menuItems: [
    {
      title: "Introduction",
      href: "/",
      shortDescription: "Welcome to Squoosher",
    },
    {
      title: "SPL Token",
      href: "/spl-token",
      shortDescription: "Create and mint SPL tokens",
      longDescription:
        "Standard Solana Program Library tokens with full control over decimals and supply.",
    },
    {
      title: "Token 2022",
      href: "/spl-token-2022",
      shortDescription: "Create and mint SPL Token 2022",
      longDescription:
        "Advanced token implementation with extended features like transfer fees and more.",
    },
  ],
};
