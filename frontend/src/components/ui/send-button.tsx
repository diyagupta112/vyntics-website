"use client";

import type { ButtonHTMLAttributes } from "react";
import styled from "styled-components";

type SendButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  state?: "idle" | "submitting" | "success" | "error";
};

export default function SendButton({ children = "Send", state = "idle", type = "submit", ...props }: SendButtonProps) {
  return <StyledWrapper>
    <button {...props} type={type} data-state={state} aria-busy={state === "submitting"}>
      <div className="svg-wrapper-1" aria-hidden="true"><div className="svg-wrapper">
        <svg viewBox="0 0 24 24" width={24} height={24}>
          {state === "success" ? <path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" strokeWidth="2" /> : <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />}
        </svg>
      </div></div>
      <span>{children}</span>
    </button>
  </StyledWrapper>;
}

const StyledWrapper = styled.div`
  width: 100%;
  && button {
    width: 100%; min-height: 3.55rem; padding: .75rem 1.25rem;
    display: flex; align-items: center; justify-content: center;
    border: 0; border-radius: 1rem; overflow: hidden;
    background: var(--color-primary); color: white; font-size: 1rem;
    font-weight: 650; cursor: pointer; transition: transform 200ms, box-shadow 200ms;
  }
  .svg-wrapper-1,.svg-wrapper { display: flex; align-items: center; }
  svg { transition: transform 300ms; transform-origin: center; }
  span { margin-left: .5rem; transition: transform 300ms, opacity 300ms; }
  && button:active:not(:disabled) { transform: scale(.95); }
  && button:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 4px; }
  && button:disabled { opacity: 1; cursor: wait; }
  && button[data-state="success"] { background: #16803c; cursor: default; }
  && button[data-state="error"] { background: #b91c1c; }
  button[data-state="submitting"] .svg-wrapper-1 { animation: send-away 700ms cubic-bezier(.4,0,1,1) both; }
  button[data-state="submitting"] svg { transform: translateX(1.2em) rotate(45deg) scale(1.1); }
  button[data-state="submitting"] > span { animation: sending-label 700ms ease both; }
  button[data-state="success"] > span { animation: sent-label 300ms ease both; }
  @keyframes send-away { from { transform: translateX(0); opacity: 1; } to { transform: translateX(40rem); opacity: 0; } }
  @keyframes sending-label { 0%,85% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes sent-label { from { opacity: 0; transform: translateY(.4rem); } to { opacity: 1; transform: none; } }
  .spinner { transform-origin: center; animation: spin 800ms linear infinite; }
  @media (hover:hover) and (pointer:fine) {
    button:not(:disabled):hover .svg-wrapper { animation: fly-1 .6s ease-in-out infinite alternate; }
    button:not(:disabled):hover svg { transform: translateX(1.2em) rotate(45deg) scale(1.1); }
    button:not(:disabled):hover span { transform: translateX(5em); opacity: 0; }
  }
  @keyframes fly-1 { from { transform: translateY(.1em); } to { transform: translateY(-.1em); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media(prefers-reduced-motion:reduce) {
    *,svg,span { animation: none !important; transition: none !important; }
    button:not(:disabled):hover svg,button:not(:disabled):hover span { transform: none; opacity: 1; }
  }
`;
