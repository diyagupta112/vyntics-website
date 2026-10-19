export const crmIntegrationLegend = [
  { id: 1, title: "CRM", description: "The CRM is the shared record of customers, contacts and deals. Fields, ownership and permissions are agreed first, so every connected tool reads and writes the same data." },
  { id: 2, title: "Website", description: "Forms and enquiries from the website create or update contacts and leads, with the source recorded so follow-up starts with context." },
  { id: 3, title: "Email", description: "Email activity is linked to the right contact and account, so conversations are visible to the team without manual logging." },
  { id: 4, title: "Marketing tools", description: "Audiences, campaigns and engagement flow between marketing tools and the CRM, so lead handoff and reporting use the same definitions." },
  { id: 5, title: "ERP", description: "Orders, invoices and account status sync between the ERP and the CRM, so sales and finance work from consistent customer information." },
  { id: 6, title: "Support", description: "Support tickets appear next to the customer record, so sales and account teams can see open issues before they reach out." },
] as const;

export type CrmIntegrationReference = typeof crmIntegrationLegend[number]["id"];
export type CrmIntegrationIcon = "crm" | "website" | "email" | "marketing" | "erp" | "support";

export const crmIntegrationHub = { title: "CRM", subtitle: "Shared customer record", icon: "crm" as CrmIntegrationIcon };
const left: readonly { label: string; subtitle: string; icon: CrmIntegrationIcon }[] = [
  { label: "Website", subtitle: "Forms and enquiries", icon: "website" },
  { label: "Email", subtitle: "Messages and activity", icon: "email" },
  { label: "Marketing tools", subtitle: "Campaigns and audiences", icon: "marketing" },
];
const right: readonly { label: string; subtitle: string; icon: CrmIntegrationIcon }[] = [
  { label: "ERP", subtitle: "Orders and billing", icon: "erp" },
  { label: "Support", subtitle: "Tickets and history", icon: "support" },
];
export const crmIntegrationGroups = [
  { label: "Customer touchpoints", side: "left" as const, items: left },
  { label: "Business systems", side: "right" as const, items: right },
] as const;

/*
 * Layout constants. The hub sits in the middle column; touchpoints stack on the
 * left and business systems on the right. Every tile, connector, label and badge
 * is derived from these values so arrows always meet tile edges exactly.
 */
export const VIEW_W = 1100;
const X0 = 18;
const TILE_W = 230, TILE_H = 84, TILE_GAP = 28;
const HUB_W = 260, HUB_H = 150;
const BLOCK_Y = 62;
const BLOCK_H = left.length * TILE_H + (left.length - 1) * TILE_GAP;
const HUB_X = (VIEW_W - HUB_W) / 2;
const RIGHT_X = VIEW_W - X0 - TILE_W;
const CENTER_Y = BLOCK_Y + BLOCK_H / 2;
export const VIEW_H = BLOCK_Y + BLOCK_H + 16;

function column(items: typeof left, x: number, top: number, firstRef: number) {
  return items.map((item, index) => {
    const y = top + index * (TILE_H + TILE_GAP);
    return { ...item, ref: (firstRef + index) as CrmIntegrationReference, x, y, w: TILE_W, h: TILE_H, cx: x + TILE_W / 2, cy: y + TILE_H / 2 };
  });
}
const leftTiles = column(left, X0, BLOCK_Y, 2);
const rightTiles = column(right, RIGHT_X, BLOCK_Y + (BLOCK_H - (right.length * TILE_H + (right.length - 1) * TILE_GAP)) / 2, 5);

const hub = { x: HUB_X, y: CENTER_Y - HUB_H / 2, w: HUB_W, h: HUB_H, cx: HUB_X + HUB_W / 2, cy: CENTER_Y };
const leftBusX = (X0 + TILE_W + HUB_X) / 2;
const rightBusX = (HUB_X + HUB_W + RIGHT_X) / 2;

export const crmIntegrationGeometry = {
  hub,
  leftTiles,
  rightTiles,
  buses: {
    left: { x: leftBusX, from: leftTiles[0].cy, to: leftTiles[leftTiles.length - 1].cy, trunkFrom: leftBusX, trunkTo: hub.x },
    right: { x: rightBusX, from: rightTiles[0].cy, to: rightTiles[rightTiles.length - 1].cy, trunkFrom: rightBusX, trunkTo: hub.x + hub.w },
  },
  columnLabels: [
    { text: "Customer touchpoints", x: X0 + 20, y: BLOCK_Y - 22 },
    { text: "Business systems", x: RIGHT_X + 20, y: rightTiles[0].y - 22 },
  ],
};
export const crmIntegrationBadges: readonly { ref: CrmIntegrationReference; x: number; y: number }[] = [
  { ref: 1, x: hub.x, y: hub.y },
  ...leftTiles.map(tile => ({ ref: tile.ref, x: tile.x, y: tile.y })),
  ...rightTiles.map(tile => ({ ref: tile.ref, x: tile.x, y: tile.y })),
];
