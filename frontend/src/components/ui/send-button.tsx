"use client";

import type { ButtonHTMLAttributes } from "react";
import styles from "./send-button.module.css";

type SendButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  state?: "idle" | "submitting" | "success" | "error";
};

function AirplaneIcon() {
  return <svg viewBox="0 0 24 24" width={24} height={24}><path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" /></svg>;
}

export default function SendButton({ children = "Send", className, state = "idle", type = "submit", ...props }: SendButtonProps) {
  return <div className={styles.wrapper}>
    <button {...props} className={[className, "siteCta"].filter(Boolean).join(" ")} type={type} data-state={state} aria-busy={state === "submitting"}>
      <div className={styles.iconOuter} aria-hidden="true"><div className={styles.iconInner}>
        {state === "success" ? <svg viewBox="0 0 24 24" width={24} height={24}><path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" strokeWidth="2" /></svg> : <AirplaneIcon />}
      </div></div>
      <div className={styles.flightPlane} aria-hidden="true"><AirplaneIcon /></div>
      <span>{children}</span>
    </button>
  </div>;
}
