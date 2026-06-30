import type { RawDataFieldDefinition } from "@/types/bnii-raw-data";

/** 28 raw fields — Okara / BNII Analytics API contract */
export const RAW_DATA_FIELDS: RawDataFieldDefinition[] = [
  {
    id: "unique_users",
    label: "Unique Users (DAU)",
    source: "BinaryOS Events",
    apiMetrics: ["new_users", "repeated_users"],
    aggregation: "derived",
    derivedFrom: ["new_users", "repeat_users"],
    statusHint: "new + repeat",
  },
  {
    id: "new_users",
    label: "New Users",
    source: "BinaryOS Events",
    apiMetrics: ["new_users"],
    aggregation: "sum",
  },
  {
    id: "repeat_users",
    label: "Repeat Users",
    source: "BinaryOS Events",
    apiMetrics: ["repeated_users"],
    aggregation: "sum",
  },
  {
    id: "total_homepage_views",
    label: "Total Homepage Views",
    source: "BinaryOS Events",
    apiMetrics: ["total_views_homepage"],
    aggregation: "sum",
  },
  {
    id: "avg_session_sec",
    label: "Avg Time Spent (s)",
    source: "BinaryOS Events",
    apiMetrics: ["avg_time_spent_seconds"],
    aggregation: "avg",
  },
  {
    id: "clicked_games_total",
    label: "Game Clicks (total)",
    source: "BinaryOS Events",
    apiMetrics: ["total_user_games"],
    aggregation: "sum",
  },
  {
    id: "stw_winners",
    label: "STW Winners",
    source: "STW Engine",
    apiMetrics: ["unique_spin_users"],
    aggregation: "sum",
  },
  {
    id: "access_pass_buyers",
    label: "Access Pass Buyers (unique)",
    source: "BNRY Token Ledger",
    apiMetrics: ["tx.use_pass.unique_users"],
    aggregation: "sum",
  },
  {
    id: "bnry_earned_total",
    label: "BNRY Earned (Total)",
    source: "BNRY Token Ledger",
    apiMetrics: ["total_bnry_tokens_earned"],
    aggregation: "sum",
  },
  {
    id: "bnry_earned_from_video",
    label: "BNRY Earned - Video (Fando + Ngage)",
    source: "BNRY Token Ledger",
    apiMetrics: ["tx.FOLLOW_GIVEN.amount", "tx.LIKE_GIVEN.amount"],
    aggregation: "sum",
  },
  {
    id: "bnry_earned_stw",
    label: "BNRY Earned - STW",
    source: "BNRY Token Ledger",
    apiMetrics: ["total_spin_win_tokens"],
    aggregation: "sum",
  },
  {
    id: "bnry_earned_screentime",
    label: "BNRY Earned - Screen Time",
    source: "BNRY Token Ledger",
    apiMetrics: ["tx.online_reward.amount"],
    aggregation: "sum",
  },
  {
    id: "bnry_earned_topup",
    label: "BNRY Earned - Topup",
    source: "BNRY Token Ledger",
    apiMetrics: ["tx.purchase.amount"],
    aggregation: "sum",
  },
  {
    id: "bnry_earned_quest",
    label: "BNRY Earned - Quest",
    source: "BNRY Token Ledger",
    apiMetrics: ["tx.QUEST_REWARD.amount"],
    aggregation: "sum",
  },
  {
    id: "bnry_spent_total",
    label: "BNRY Spent (Total)",
    source: "BNRY Token Ledger",
    apiMetrics: ["total_bnry_tokens_spent"],
    aggregation: "sum",
  },
  {
    id: "bnry_spent_emart",
    label: "BNRY Spent - eMart",
    source: "BnryMart",
    apiMetrics: ["tx.ecoupon_purchase.amount", "tx.voucher_redemption.amount"],
    aggregation: "sum",
  },
  {
    id: "bnry_spent_access_pass",
    label: "BNRY Spent - Access Pass",
    source: "BNRY Token Ledger",
    apiMetrics: ["tx.use_pass.amount"],
    aggregation: "sum",
  },
  {
    id: "txns_emart",
    label: "Transactions - eMart",
    source: "BnryMart",
    apiMetrics: ["tx.ecoupon_purchase.count", "tx.voucher_redemption.count"],
    aggregation: "sum",
  },
  {
    id: "txns_quest",
    label: "Transactions - Quest",
    source: "BinaryOS Events",
    apiMetrics: ["tx.QUEST_REWARD.count"],
    aggregation: "sum",
  },
  {
    id: "users_quests",
    label: "Users Completing Quests",
    source: "BinaryOS Events",
    apiMetrics: ["tx.QUEST_REWARD.unique_users"],
    aggregation: "sum",
  },
  {
    id: "stw_tx",
    label: "STW Transactions",
    source: "STW Engine",
    apiMetrics: ["tx.used_spin_wheel.count"],
    aggregation: "sum",
  },
  {
    id: "total_transactions",
    label: "Total Transactions",
    source: "BNRY Token Ledger",
    apiMetrics: ["total_transactions"],
    aggregation: "sum",
  },
  {
    id: "total_credit",
    label: "Total Credit (BNRY In)",
    source: "BNRY Token Ledger",
    apiMetrics: ["total_credit"],
    aggregation: "sum",
  },
  {
    id: "total_debit",
    label: "Total Debit (BNRY Out)",
    source: "BNRY Token Ledger",
    apiMetrics: ["total_debit"],
    aggregation: "sum",
  },
  {
    id: "dau_ga",
    label: "Daily Active Users (GA4)",
    source: "GA4 · BNII API",
    apiMetrics: ["dau_ga"],
    aggregation: "avg",
  },
  {
    id: "mau_d30",
    label: "30-Day Rolling MAU",
    source: "GA4 · BNII API",
    apiMetrics: ["mau_ga"],
    aggregation: "last",
  },
  {
    id: "spin_usage",
    label: "Spin Wheel Plays",
    source: "STW Engine",
    apiMetrics: ["total_spin_usage"],
    aggregation: "sum",
  },
  {
    id: "bnry_net",
    label: "Net BNRY (Earned − Spent)",
    source: "BNRY Token Ledger",
    apiMetrics: [],
    aggregation: "derived",
    derivedFrom: ["bnry_earned_total", "bnry_spent_total"],
  },
];

export function collectQueryMetrics(): string[] {
  const keys = new Set<string>();
  for (const field of RAW_DATA_FIELDS) {
    for (const metric of field.apiMetrics) {
      keys.add(metric);
    }
  }
  return [...keys];
}
