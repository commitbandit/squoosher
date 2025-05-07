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
      shortDescription: "Create and manage classic SPL tokens",
      longDescription:
        "Standard Solana Program Library tokens with configurable supply, mint authority, and decimals — widely used for fungible tokens on Solana.",
    },
    {
      title: "SPL Token 2022",
      href: "/spl-token-2022",
      shortDescription: "Explore advanced token features",
      longDescription:
        "Next-generation SPL Token program with support for features like transfer fees, interest-bearing tokens, confidential transfers, and multisig authorities.",
    },
    {
      title: "Airdrop Creator",
      href: "/airdrop-creator",
      shortDescription: "Create Airdrop with Compressed Tokens",
      longDescription: "Next-generation SPL Token program.",
    },
  ],
};
