import type { HTMLAttributes } from "react";

import styles from "./card.module.css";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  const classes = [styles.card, className].filter(Boolean).join(" ");

  return <div className={classes} {...props} />;
}
