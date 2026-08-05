// lib/pricing.ts
//
// What things cost. The server decides this, never the browser.
//
// /api/register used to charge `priceNum` straight from the request body, with
// only a 0..50000 integer bound on it — so a crafted request bought a 1.500 MDL
// ticket for 1 leu, PDF and confirmation email included. Prices now come from
// here and the client's number is ignored.
//
// No DB import, so client components can render from the same constants and
// display can never drift from what is charged.

export type TicketType = 'Student' | 'Resident' | 'Nurse'

export const TICKET_PRICES_MDL: Record<TicketType, number> = {
  Student:  1500,
  Resident: 2000,
  Nurse:    1500,
}

/** Surcharge for a hands-on workshop, on top of the registration fee. */
export const HANDZONE_PRICE_MDL = 1000

/** Total charged for one registration, in MDL. */
export function ticketPrice(type: TicketType, hasHandzone: boolean): number {
  return TICKET_PRICES_MDL[type] + (hasHandzone ? HANDZONE_PRICE_MDL : 0)
}

/** "1.500,00 MDL" — the display form used across the registration pages. */
export function formatMDL(amount: number): string {
  return amount.toLocaleString('ro-MD', { minimumFractionDigits: 2 }) + ' MDL'
}
