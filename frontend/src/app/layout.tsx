import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import { DeferredChatWidget } from "@/components/chat/deferred-chat-widget";
import { ConsentProvider } from "@/components/consent/consent-provider";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { ScrollRestoration } from "@/components/layout/scroll-restoration";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import "@fontsource-variable/dm-sans";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vyntics",
    template: "%s | Vyntics",
  },
  description: "Analytics meets velocity. AI does the work. Vyntics delivers custom AI, data engineering, analytics, cloud, and CRM solutions that help businesses turn complex problems into impactful outcomes.",
};

// Marks each <img> that is still downloading so globals.css can show a grey placeholder in its box.
// Runs inline in <head> so server-rendered images are tagged as they are parsed. Cached images are never tagged.
// The fade-in marker only plays for loads that took a moment and is removed again once the fade is over.
// Every <img> and <Image> in the app sets suppressHydrationWarning, because these attributes can be present before React hydrates.
const imageSkeletonScript = `(function(){if(window.__vynticsImageSkeleton)return;window.__vynticsImageSkeleton=1;var D=80,p=new WeakMap();function track(i){if(i.complete||p.has(i)||i.hasAttribute("data-no-skeleton"))return;p.set(i,Date.now());i.setAttribute("data-img-loading","")}function settle(e){var i=e.target;if(!(i instanceof HTMLImageElement))return;if(e.type==="load")i.removeAttribute("data-img-failed");var t=p.get(i);if(t===undefined)return;p.delete(i);i.removeAttribute("data-img-loading");if(e.type==="error"){i.setAttribute("data-img-failed","");return}if(Date.now()-t>D){i.setAttribute("data-img-reveal","");setTimeout(function(){i.removeAttribute("data-img-reveal")},400)}}document.addEventListener("load",settle,true);document.addEventListener("error",settle,true);new MutationObserver(function(m){for(var a=0;a<m.length;a++)for(var n=m[a].addedNodes,b=0;b<n.length;b++){var x=n[b];if(x.nodeType!==1)continue;if(x.tagName==="IMG")track(x);else if(x.querySelectorAll){var l=x.querySelectorAll("img");for(var c=0;c<l.length;c++)track(l[c])}}}).observe(document.documentElement,{childList:true,subtree:true});var e=document.querySelectorAll("img");for(var k=0;k<e.length;k++)track(e[k])})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script id="vyntics-theme-init" src="/theme-init.js" async />
        <script id="vyntics-image-skeleton" dangerouslySetInnerHTML={{ __html: imageSkeletonScript }} />
      </head>
      <body>
        <ScrollRestoration />
        <ServiceWorkerRegister />
        <ConsentProvider>
          {children}
          <CookieConsent />
          <DeferredChatWidget />
        </ConsentProvider>
      </body>
    </html>
  );
}
