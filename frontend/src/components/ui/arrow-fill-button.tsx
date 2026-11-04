import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import styles from "./arrow-fill-button.module.css";

type ArrowFillButtonProps = { children: ReactNode; className?: string; compact?: boolean; alignEnd?: boolean } & (
  | { href: string; native?: boolean; onClick?: MouseEventHandler<HTMLAnchorElement> }
  | { href?: undefined; native?: undefined; onClick?: MouseEventHandler<HTMLButtonElement> }
);

function Arrow() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowFillButton(props: ArrowFillButtonProps) {
  const { children, className } = props;
  const classes = [styles.button, props.compact ? styles.compact : "", className].filter(Boolean).join(" ");
  const content = (
    <>
      <span className={styles.label}>{children}</span>
      <span className={styles.fill} aria-hidden="true" />
      <span className={styles.overlay} aria-hidden="true"><span>{children}</span></span>
      <span className={styles.circle} aria-hidden="true">
        <span className={`${styles.iconSlot} ${styles.enter}`}><Arrow /></span>
        <span className={`${styles.iconSlot} ${styles.exit}`}><Arrow /></span>
      </span>
    </>
  );
  const button = props.href === undefined
    ? <button className={classes} data-arrow-fill="" type="button" onClick={props.onClick}>{content}</button>
    : props.native
      ? <a className={classes} data-arrow-fill="" href={props.href} onClick={props.onClick}>{content}</a>
      : <Link className={classes} data-arrow-fill="" href={props.href} onClick={props.onClick}>{content}</Link>;
  return props.alignEnd ? <div className={styles.end}>{button}</div> : button;
}
