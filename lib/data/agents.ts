import { Agent } from "@/lib/types";

export const agents: Agent[] = [
  {
    id: "concert-ticket-finder",
    name: "Concert Ticket Finder",
    author: "SoundWave Labs",
    description:
      "Discover live concerts by artist, genre, city, and month. Snipe tickets with Ticket Sniper Bot automation and get AI-powered recommendations.",
    icon: "🎵",
    category: "Entertainment",
    tags: ["concerts", "music", "tickets", "sniper", "automation"],
    rating: 4.8,
    reviewCount: 1243,
    userCount: 28500,
    price: "Free",
    badges: ["Featured", "Hot", "Free"],
    featured: true,
  },
  {
    id: "flight-hotel-finder",
    name: "Flight & Hotel Finder",
    author: "SkyRoute AI",
    description:
      "Search flights, hotels, or bundled travel deals. Use Snipe Mode to hunt by route and budget, or snipe individual listings with Ticket Sniper Bot automation.",
    icon: "✈️",
    category: "Travel",
    tags: ["flights", "hotels", "travel", "bundles", "sniper"],
    rating: 4.7,
    reviewCount: 2105,
    userCount: 45200,
    price: "Free",
    badges: ["Featured", "Free"],
    featured: true,
  },
  {
    id: "currency-exchange",
    name: "Currency Exchange",
    author: "ForexPulse",
    description:
      "Convert between 20 world currencies. Scan top 10 banks and local exchange agents by country, then snipe the best traveler rate with Ticket Sniper Bot.",
    icon: "💱",
    category: "Finance",
    tags: ["currency", "forex", "exchange", "rates", "sniper"],
    rating: 4.5,
    reviewCount: 567,
    userCount: 12400,
    price: "Free",
    badges: ["Free"],
    featured: false,
  },
  {
    id: "car-rental-finder",
    name: "Car Rental Finder",
    author: "DriveEasy",
    description:
      "Find rental cars by type, transmission, and budget. Snipe daily rates with Ticket Sniper Bot and get AI rental advice.",
    icon: "🚗",
    category: "Travel",
    tags: ["cars", "rental", "transport", "road trip", "sniper"],
    rating: 4.4,
    reviewCount: 412,
    userCount: 8900,
    price: "Free",
    badges: ["New", "Free"],
    featured: false,
  },
  {
    id: "event-deal-flash-sale",
    name: "Event Deal & Flash Sale",
    author: "DealRadar",
    description:
      "Browse live flash sales and event deals across electronics, travel, tickets, fashion, and home. Filter by discount, category, and ending soon.",
    icon: "⚡",
    category: "Entertainment",
    tags: ["deals", "flash sale", "discounts", "shopping", "events"],
    rating: 4.5,
    reviewCount: 743,
    userCount: 18900,
    price: "Free",
    badges: ["Hot", "Free"],
    featured: false,
  },
  {
    id: "event-deal-hunter",
    name: "Event Deal Hunter",
    author: "DealRadar",
    description:
      "Snipe flash sale drops, restocks, and price cuts. Set target prices and auto-checkout via Ticket Sniper Bot when deals go live.",
    icon: "🎯",
    category: "Entertainment",
    tags: ["deals", "snipe", "flash sale", "tickets", "automation"],
    rating: 4.8,
    reviewCount: 956,
    userCount: 26700,
    price: "Free",
    badges: ["Featured", "Hot", "Free"],
    featured: true,
  },
  {
    id: "personal-loan-finder",
    name: "Personal Loan Finder",
    author: "RateLend",
    description:
      "Compare personal loan interest rates from banks, fintech lenders, and credit unions. Calculate monthly payments and snipe your target APR with Loan Rate Sniper Bot.",
    icon: "💰",
    category: "Finance",
    tags: ["loans", "apr", "interest rates", "compare", "sniper"],
    rating: 4.8,
    reviewCount: 1245,
    userCount: 31200,
    price: "Free",
    badges: ["Featured", "Hot", "Free"],
    featured: true,
  },
];

export const categories = [
  "All",
  "Travel",
  "Entertainment",
  "Finance",
] as const;

export function getAgentById(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

export function getFeaturedAgents(): Agent[] {
  return agents.filter((a) => a.featured).slice(0, 4);
}

export function getMarketplaceStats() {
  const uniqueCategories = new Set(agents.map((a) => a.category));
  const totalUsers = agents.reduce((sum, a) => sum + a.userCount, 0);
  const avgRating =
    agents.reduce((sum, a) => sum + a.rating, 0) / agents.length;
  return {
    totalAgents: agents.length,
    categories: uniqueCategories.size,
    monthlyUsers: Math.round(totalUsers * 0.12),
    avgRating: Math.round(avgRating * 10) / 10,
  };
}
