"use client";

import { useRef } from "react";
import styles from "./hero.module.css";

const POSTER = "/chatbot-product-poster.jpg";

export function HeroDemoButton({ className }: { className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  const open = () => {
    dialog.current?.showModal();
    if (video.current) {
      video.current.currentTime = 0;
      void video.current.play().catch(() => {});
    }
  };

  return (
    <>
      <button className={className} type="button" onClick={open}>
        <svg aria-hidden="true" viewBox="0 0 16 16" width="12" height="12"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>
        Watch the demo
      </button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label="Product walkthrough video"
        onClose={() => video.current?.pause()}
        onClick={(event) => { if (event.target === dialog.current) dialog.current?.close(); }}
      >
        <button className={styles.dialogClose} type="button" aria-label="Close video" onClick={() => dialog.current?.close()}>
          <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
        <video ref={video} className={styles.fullVideo} poster={POSTER} controls playsInline preload="none">
          <source src="/chatbot-product.webm" type="video/webm" />
          <source src="/chatbot-product.mp4" type="video/mp4" />
        </video>
      </dialog>
    </>
  );
}
