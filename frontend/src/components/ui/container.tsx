import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import styles from "./container.module.css";

type ContainerProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  /** Use the wide container width for intentionally broad layouts. */
  wide?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Container<T extends ElementType = "div">({
  as,
  children,
  className = "",
  wide = false,
  ...props
}: ContainerProps<T>) {
  const Component = as ?? "div";

  return (
    <Component className={`${styles.container}${wide ? ` ${styles.wide}` : ""} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
