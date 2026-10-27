"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { LifeAtVynticsImage } from "@/lib/life-at-vyntics";
import { clampRatio, composeBatch, shapeOf, type Block, type Placed } from "@/lib/life-at-vyntics-layout";
import styles from "./life-at-vyntics.module.css";

const INITIAL_COUNT = 5;
const BATCH_COUNT = 5;
const MEASURE_TIMEOUT = 8000;

type Dimensions = { width: number; height: number };

/** Reads an image's intrinsic size. A broken image resolves to null; one that is only slow falls back to 4:3. */
function measure(url: string): Promise<Dimensions | null> {
  return new Promise(resolve => {
    const probe = new Image();
    const timer = setTimeout(() => resolve({ width: 4, height: 3 }), MEASURE_TIMEOUT);
    const finish = (value: Dimensions | null) => { clearTimeout(timer); resolve(value); };
    probe.onload = () => finish(probe.naturalWidth && probe.naturalHeight ? { width: probe.naturalWidth, height: probe.naturalHeight } : null);
    probe.onerror = () => finish(null);
    probe.decoding = "async";
    probe.src = url;
  });
}

const vars = (values: Record<string, string | number>) => values as CSSProperties;
/** Ratio used on narrow screens, where every photo simply stacks. */
const stackRatio = (ratio: number) => Math.min(1.8, Math.max(0.75, ratio));

export function LifeAtVynticsSkeletonCollage() {
  return <div className={styles.collage} aria-hidden="true">
    <div className={`${styles.tile} ${styles.feature} ${styles.skeleton}`} style={vars({ "--r": 2.2, "--rm": 1.6 })} />
    <div className={styles.row} style={vars({ "--n": 2, "--sum": 2.1 })}>
      <div className={`${styles.tile} ${styles.skeleton}`} style={vars({ "--r": 0.8, "--rm": 1 })} />
      <div className={`${styles.tile} ${styles.skeleton}`} style={vars({ "--r": 1.3, "--rm": 1.3 })} />
    </div>
  </div>;
}

export function LifeAtVynticsGallery({ images }: { images: LifeAtVynticsImage[] }) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [broken, setBroken] = useState<ReadonlySet<string>>(new Set());
  const busy = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  /** Measures the next batch, composes it on its own and appends it, so blocks that are already on screen never move. */
  const loadBatch = useCallback(async (from: number) => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    let next = from;
    let composed: Block[] = [];
    while (next < images.length && composed.length === 0) {
      const size = next === 0 ? INITIAL_COUNT : BATCH_COUNT;
      const slice = images.slice(next, next + size);
      const measured = await Promise.all(slice.map(async (image, offset) => ({ image, number: next + offset + 1, size: await measure(image.image_url) })));
      const placed: Placed[] = measured.flatMap(({ image, number, size: dimensions }) =>
        dimensions ? [{ image, number, ratio: clampRatio(dimensions.width / dimensions.height) }] : []);
      next += slice.length;
      composed = composeBatch(placed, from === 0);
    }
    busy.current = false;
    if (!alive.current) return;
    setBlocks(current => [...current, ...composed]);
    setCursor(next);
    setLoading(false);
  }, [images]);

  useEffect(() => { void loadBatch(0); }, [loadBatch]);

  const tile = ({ image, number, ratio }: Placed, extra?: string) => <figure key={image.id}
    className={extra ? `${styles.tile} ${extra}` : styles.tile} data-shape={shapeOf(ratio)}
    style={vars({ "--r": ratio.toFixed(3), "--rm": stackRatio(ratio).toFixed(3) })}>
    {!broken.has(image.id) && <img className={styles.image} src={image.image_url} alt={`Vyntics team moment ${number}`} loading="lazy" decoding="async"
      onError={() => setBroken(current => new Set(current).add(image.id))} />}
  </figure>;

  const render = (block: Block) => {
    if (block.kind === "feature" || block.kind === "solo") return tile(block.tiles[0], block.kind === "feature" ? styles.feature : styles.solo);
    if (block.kind === "row") {
      const sum = block.tiles.reduce((total, item) => total + item.ratio, 0);
      return <div key={block.tiles[0].image.id} className={styles.row} style={vars({ "--n": block.tiles.length, "--sum": sum.toFixed(3) })}>
        {block.tiles.map(item => tile(item))}
      </div>;
    }
    const [first, second, third] = block.tiles;
    const tall = block.tallFirst ? first : third;
    const pair = block.tallFirst ? [second, third] : [first, second];
    const s = 1 / pair[0].ratio + 1 / pair[1].ratio;
    return <div key={first.image.id} className={styles.stack} data-side={block.tallFirst ? "left" : "right"}
      style={vars({ "--rl": tall.ratio.toFixed(3), "--s": s.toFixed(3), "--f1": `${(1 / pair[0].ratio).toFixed(3)}fr`, "--f2": `${(1 / pair[1].ratio).toFixed(3)}fr` })}>
      {block.tallFirst ? <>{tile(tall, styles.tall)}<div className={styles.column}>{pair.map(item => tile(item))}</div></>
        : <><div className={styles.column}>{pair.map(item => tile(item))}</div>{tile(tall, styles.tall)}</>}
    </div>;
  };

  const shown = blocks.reduce((total, block) => total + block.tiles.length, 0);
  const hasMore = cursor < images.length;

  return <div className={styles.gallery}>
    {blocks.length === 0 && loading ? <LifeAtVynticsSkeletonCollage />
      : <div className={styles.collage}>{blocks.map(render)}</div>}
    <p className={styles.srOnly} role="status">{loading ? "Loading photos" : `Showing ${shown} of ${images.length} photos`}</p>
    {blocks.length > 0 && hasMore && <div className={styles.more}>
      <button type="button" className={styles.moreButton} disabled={loading} aria-busy={loading} onClick={() => void loadBatch(cursor)}>
        {loading ? "Loading" : "See more"}
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 8l5 5 5-5" /></svg>
      </button>
    </div>}
  </div>;
}
