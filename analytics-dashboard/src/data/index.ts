import type { TelecomOperator } from "@/types";

import operatorsData from "./telecom-operators.json";

export const operators = operatorsData as TelecomOperator[];

export function getOperatorById(id: string) {
  return operators.find((o) => o.id === id);
}

export function getOperatorName(id: string) {
  return getOperatorById(id)?.name ?? id;
}
