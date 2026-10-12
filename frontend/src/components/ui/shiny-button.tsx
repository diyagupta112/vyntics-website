"use client";

import type { MouseEventHandler, ReactNode } from "react";
import styles from "./shiny-button.module.css";

type ShinyButtonProps = { children: ReactNode; className?: string } & (
  | { href: string; onClick?: MouseEventHandler<HTMLAnchorElement> }
  | { href?: undefined; onClick?: MouseEventHandler<HTMLButtonElement>; disabled?: boolean }
);

export function ShinyButton(props: ShinyButtonProps) {
  const className = `${styles.shiny} ${props.className ?? ""}`;
  const content = <span className={styles.label}>{props.children}</span>;
  return props.href !== undefined
    ? <a className={className} href={props.href} onClick={props.onClick}>{content}</a>
    : <button className={className} type="button" onClick={props.onClick} disabled={props.disabled}>{content}</button>;
}
