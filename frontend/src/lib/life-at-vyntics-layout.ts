import type { LifeAtVynticsImage } from "@/lib/life-at-vyntics";

/*
 * Image-aware collage composition. Every size below is relative to the collage width (1 = full width), so the
 * maths is independent of the screen. Each block is a composition strategy; which one is used for a group of
 * images is decided by how much cropping it would cost, so the photos shape the layout and not the other way round.
 */

export type Placed = { image: LifeAtVynticsImage; number: number; ratio: number };
export type Block =
  | { kind: "feature"; tiles: [Placed] }
  | { kind: "solo"; tiles: [Placed] }
  | { kind: "row"; tiles: Placed[] }
  | { kind: "stack"; tiles: [Placed, Placed, Placed]; tallFirst: boolean };

export type ImageShape = "portrait" | "square" | "landscape" | "wide";

const MIN_RATIO = 0.45;
const MAX_RATIO = 3;
const GAP = 0.012;
const CAP_ROW = 0.38;
const CAP_FEATURE = 0.38;
const CAP_STACK = 0.49;
const MIN_ROW_HEIGHT = 0.13;
const MIN_SIDE_WIDTH = 0.2;
const BLOCK_COST = 0.03;
const REPEAT_COST = 0.06;
const SOLO_COST = 0.1;

export const clampRatio = (ratio: number) => Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));

export function shapeOf(ratio: number): ImageShape {
  if (ratio < 0.85) return "portrait";
  if (ratio < 1.18) return "square";
  if (ratio < 1.9) return "landscape";
  return "wide";
}

/** How much of an image is lost when its natural ratio is shown at another ratio (0 = nothing). */
const cropLoss = (natural: number, shown: number) => 1 - Math.min(natural, shown) / Math.max(natural, shown);
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

type Candidate = { block: Block; cost: number };

function rowCandidate(tiles: Placed[]): Candidate {
  const sum = tiles.reduce((total, tile) => total + tile.ratio, 0);
  const available = 1 - GAP * (tiles.length - 1);
  const natural = available / sum;
  const height = Math.min(natural, CAP_ROW);
  const loss = mean(tiles.map(tile => cropLoss(tile.ratio, (available * tile.ratio / sum) / height)));
  const short = natural < MIN_ROW_HEIGHT ? 0.12 * (MIN_ROW_HEIGHT - natural) / MIN_ROW_HEIGHT : 0;
  return { block: { kind: "row", tiles }, cost: loss + short };
}

function featureCandidate(tile: Placed): Candidate {
  const loss = cropLoss(tile.ratio, Math.max(tile.ratio, 1 / CAP_FEATURE));
  const bonus = tile.ratio >= 1.7 ? 0.04 : 0;
  return { block: { kind: "feature", tiles: [tile] }, cost: loss - bonus };
}

function soloCandidate(tile: Placed): Candidate | null {
  return tile.ratio < 1.5 ? { block: { kind: "solo", tiles: [tile] }, cost: SOLO_COST } : null;
}

/** One image on one side with two stacked on the other. `tallFirst` puts the single image on the left. */
function stackCandidate(tiles: [Placed, Placed, Placed], tallFirst: boolean): Candidate | null {
  const tall = tallFirst ? tiles[0] : tiles[2];
  const pair = tallFirst ? [tiles[1], tiles[2]] : [tiles[0], tiles[1]];
  const s = 1 / pair[0].ratio + 1 / pair[1].ratio;
  const natural = (1 - GAP + GAP / s) / (tall.ratio + 1 / s);
  const height = Math.min(natural, CAP_STACK);
  const sideWidth = 1 - GAP - height * tall.ratio;
  if (sideWidth < MIN_SIDE_WIDTH) return null;
  const losses = pair.map(tile => cropLoss(tile.ratio, sideWidth / ((height - GAP) * (1 / tile.ratio) / s)));
  return { block: { kind: "stack", tiles, tallFirst }, cost: mean([0, ...losses]) };
}

function candidatesAt(items: Placed[], at: number): Candidate[] {
  const out: (Candidate | null)[] = [featureCandidate(items[at]), soloCandidate(items[at])];
  if (items.length - at >= 2) out.push(rowCandidate(items.slice(at, at + 2)));
  if (items.length - at >= 3) {
    const three = items.slice(at, at + 3) as [Placed, Placed, Placed];
    out.push(rowCandidate(three), stackCandidate(three, true), stackCandidate(three, false));
  }
  return out.filter((candidate): candidate is Candidate => candidate !== null);
}

const familyOf = (block: Block) => `${block.kind}${block.kind === "row" ? block.tiles.length : ""}`;

/**
 * Chooses the cheapest sequence of blocks for one batch of images, looking ahead across the whole batch and
 * discouraging the same composition twice in a row. Images keep their display order.
 */
export function composeBatch(items: Placed[], opensGallery: boolean): Block[] {
  const memo = new Map<string, { cost: number; blocks: Block[] }>();
  const solve = (at: number, previous: string): { cost: number; blocks: Block[] } => {
    if (at >= items.length) return { cost: 0, blocks: [] };
    const key = `${at}|${previous}`;
    const cached = memo.get(key);
    if (cached) return cached;
    let best = { cost: Infinity, blocks: [] as Block[] };
    for (const candidate of candidatesAt(items, at)) {
      const family = familyOf(candidate.block);
      let cost = candidate.cost + BLOCK_COST + (family === previous ? REPEAT_COST : 0);
      if (opensGallery && at === 0 && candidate.block.kind === "feature") cost -= 0.03;
      const rest = solve(at + candidate.block.tiles.length, family);
      if (cost + rest.cost < best.cost) best = { cost: cost + rest.cost, blocks: [candidate.block, ...rest.blocks] };
    }
    memo.set(key, best);
    return best;
  };
  return solve(0, "").blocks;
}
