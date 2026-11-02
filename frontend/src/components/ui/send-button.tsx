"use client";

import type { ButtonHTMLAttributes } from "react";
import styled from "styled-components";

type SendButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  state?: "idle" | "submitting" | "success" | "error";
};

function AirplaneIcon() {
  return <svg viewBox="0 0 24 24" width={24} height={24}><path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" /></svg>;
}

export default function SendButton({ children = "Send", className, state = "idle", type = "submit", ...props }: SendButtonProps) {
  return <StyledWrapper>
    <button {...props} className={[className, "siteCta"].filter(Boolean).join(" ")} type={type} data-state={state} aria-busy={state === "submitting"}>
      <div className="svg-wrapper-1" aria-hidden="true"><div className="svg-wrapper">
        {state === "success" ? <svg viewBox="0 0 24 24" width={24} height={24}><path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" strokeWidth="2" /></svg> : <AirplaneIcon />}
      </div></div>
      <div className="flight-plane" aria-hidden="true"><AirplaneIcon /></div>
      <span>{children}</span>
    </button>
  </StyledWrapper>;
}

const StyledWrapper = styled.div`
  width: 100%;
  && button {
    position: relative;
    width: 100%; min-height: 3.55rem; padding: .75rem 1.25rem;
    display: flex; align-items: center; justify-content: center;
    border: 0; border-radius: 1rem; overflow: hidden;
    background: var(--color-primary); color: white; font-size: 1rem;
    font-weight: 650; cursor: pointer; transition: transform 200ms, box-shadow 200ms;
  }
  .svg-wrapper-1,.svg-wrapper { display: flex; align-items: center; }
  .svg-wrapper-1 { transition: opacity 180ms ease; }
  svg { transition: transform 300ms; transform-origin: center; }
  button > span { margin-left: .5rem; transition: transform 180ms ease, opacity 180ms ease; }
  .flight-plane { position: absolute; inset: 0; display: grid; place-items: center; opacity: 0; pointer-events: none; transition: opacity 180ms ease; }
  .flight-plane svg { width: 1.75rem; height: 1.75rem; transform: rotate(45deg); }
  button:not(:disabled):is(:hover, :focus-visible) .svg-wrapper-1,
  button:not(:disabled):is(:hover, :focus-visible) > span { opacity: 0; }
  button:not(:disabled):is(:hover, :focus-visible) > span { transform: translateX(1rem); }
  button:not(:disabled):is(:hover, :focus-visible) .flight-plane { opacity: 1; }
  button:not(:disabled):is(:hover, :focus-visible) .flight-plane svg { animation: airplane-ready 800ms ease-in-out infinite alternate; }
  && button:active:not(:disabled) { transform: scale(.95); }
  && button:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 4px; }
  && button:disabled { opacity: 1; cursor: wait; }
  && button[data-state="success"] { background: #16803c; cursor: default; }
  && button[data-state="error"] { background: #b91c1c; }
  button[data-state="submitting"] .svg-wrapper-1 { display: none; }
  button[data-state="submitting"] .flight-plane { animation: send-away 450ms cubic-bezier(.4,0,1,1) both; }
  button[data-state="submitting"] > span { margin-left: 0; animation: sending-label 450ms ease both; }
  button[data-state="success"] > span { animation: sent-label 300ms ease both; }
  @keyframes airplane-ready { from { transform: translateY(1px) rotate(45deg); } to { transform: translateY(-3px) rotate(45deg) scale(1.06); } }
  @keyframes send-away { 0% { transform: translateX(0); opacity: 1; } 70% { opacity: 1; } 100% { transform: translateX(100%); opacity: 0; } }
  @keyframes sending-label { 0%,85% { opacity: 0; transform: none; } 100% { opacity: 1; transform: none; } }
  @keyframes sent-label { from { opacity: 0; transform: translateY(.4rem); } to { opacity: 1; transform: none; } }
  .spinner { transform-origin: center; animation: spin 800ms linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media(prefers-reduced-motion:reduce) {
    *,svg,span { animation: none !important; transition: none !important; }
    .flight-plane { display: none; }
    button:not(:disabled):is(:hover, :focus-visible) .svg-wrapper-1,
    button:not(:disabled):is(:hover, :focus-visible) > span { transform: none; opacity: 1; }
  }
`;
