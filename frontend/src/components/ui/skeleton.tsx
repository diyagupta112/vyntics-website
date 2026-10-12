import type { CSSProperties } from "react";
import styles from "./skeleton.module.css";

export function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={`${styles.block} ${className}`} style={style} />;
}

export function SkeletonLines({ widths = ["100%", "90%", "72%"], className = "" }: { widths?: string[]; className?: string }) {
  return <div aria-hidden="true" className={`${styles.lines} ${className}`}>{widths.map((width, index) => <Skeleton key={index} style={{ width }} />)}</div>;
}
