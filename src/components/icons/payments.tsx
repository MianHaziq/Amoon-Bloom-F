/**
 * Brand-correct mini SVG marks for payment methods. Stroke-free for the brand
 * colours; they sit on a light pill in the footer.
 */
import type { SVGProps } from "react";

const base = { width: 36, height: 24, viewBox: "0 0 36 24", "aria-hidden": true } as const;

export const VisaMark = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props}>
    <rect width="36" height="24" rx="4" fill="#1A1F71" />
    <path
      d="M14.6 9.5h-2.2l-1.4 5.5-.6-3.2c-.1-.6-.6-.9-1.2-.9H6l-.1.4c.9.2 1.8.5 2.6.9l1.5 5.6h2.3l3-7.3h-.7Zm1.6 0L14.7 17h2.1l1.5-7.5h-2.1Zm9.5.1c-.5-.2-1.3-.4-2.2-.4-2.4 0-4 1.3-4.1 3.1 0 1.4 1.2 2.1 2.2 2.6.9.4 1.3.7 1.3 1.1 0 .6-.7.9-1.4.9-1 0-1.5-.1-2.2-.4l-.3-.2-.4 2c.6.3 1.6.5 2.7.5 2.5 0 4.2-1.2 4.2-3.2 0-1-.7-1.8-2.1-2.5-.9-.4-1.4-.7-1.4-1.1 0-.4.5-.8 1.4-.8.8 0 1.4.2 1.8.4l.2.1.5-1.9Zm5.3-.1h-1.7c-.5 0-.9.1-1.2.6L26.1 17h2.4s.4-1.1.5-1.4h2.9c0 .3.3 1.4.3 1.4h2.1L31.6 9.5Zm-2.5 4.6c.2-.5.9-2.4.9-2.4l.4-1 .2 1c.1.5.4 2 .5 2.5l-2 -.1Z"
      fill="#fff"
    />
  </svg>
);

export const MastercardMark = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props}>
    <rect width="36" height="24" rx="4" fill="#fff" stroke="#e5e1d8" />
    <circle cx="14.5" cy="12" r="6" fill="#EB001B" />
    <circle cx="21.5" cy="12" r="6" fill="#F79E1B" />
    <path
      d="M18 7.5a6 6 0 0 0 0 9 6 6 0 0 0 0-9Z"
      fill="#FF5F00"
    />
  </svg>
);

export const ApplePayMark = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props}>
    <rect width="36" height="24" rx="4" fill="#000" />
    <path
      d="M11.5 9.4c.2-.3.4-.7.4-1.1 0-.1 0-.1-.1-.2-.4 0-.8.2-1.1.5-.2.3-.4.6-.4 1 .4 0 .8-.2 1.2-.5v.3Zm.4.2c-.6 0-1.1.3-1.4.3s-.7-.3-1.2-.3c-.6 0-1.2.3-1.5 1-.6 1.1-.2 2.7.4 3.6.3.4.7 1 1.2 1 .5 0 .7-.3 1.3-.3s.7.3 1.2.3c.5 0 .9-.5 1.2-.9.4-.5.5-1 .5-1 0 0-1-.4-1-1.5 0-.9.7-1.4.7-1.4-.4-.6-1-.7-1.4-.8Zm5.7-1.9h-2.4v6.7h1V12h1.4c1.3 0 2.1-.7 2.1-2 0-1.2-.8-2.3-2.1-2.3Zm-.2 3.4h-1.2V8.5h1.2c.8 0 1.3.5 1.3 1.3 0 .9-.5 1.3-1.3 1.3Zm5.3 1c-1 0-1.7.6-1.7 1.4 0 .8.6 1.3 1.6 1.3.7 0 1.3-.4 1.6-.9v.8h.9V11.4c0-.9-.7-1.5-1.9-1.5-1.1 0-1.8.6-1.9 1.4h.9c.1-.4.4-.6 1-.6.6 0 1 .3 1 .9v.4l-1.5 0Zm1.5.7v.4c0 .6-.6 1.1-1.3 1.1-.6 0-.9-.3-.9-.7 0-.5.3-.8 1-.8h1.2Zm2.7 3.7c1 0 1.4-.4 1.8-1.5l1.6-4.4h-1l-1.1 3.4-1.1-3.4h-1l1.5 4.3-.1.3c-.1.4-.4.6-.7.6h-.4v.7c.1 0 .3.1.5 0Z"
      fill="#fff"
    />
  </svg>
);
