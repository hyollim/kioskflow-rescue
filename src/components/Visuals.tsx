import type { Product } from "../domain/order";
import type { CSSProperties } from "react";
const paths = {
  arrow: "M4 12h16m-6-6 6 6-6 6",
  back: "M20 12H4m6-6-6 6 6 6",
  check: "m5 12 4 4L19 6",
  bag: "M5 7h14l1 14H4L5 7Zm4 0V5a3 3 0 0 1 6 0v2",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-5",
  spark: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z",
  chart: "M4 20h17M7 16V9m5 7V4m5 12v-5",
  reset: "M4 10a8 8 0 1 1 1 8M4 4v6h6",
  external: "M14 3h7v7m0-7L10 14M10 3H4v17h17v-6",
  terminal: "M5 3h14v14H5V3Zm3 3h8v6H8V6ZM3 21h18m-9-4v4",
  calculator: "M5 3h14v18H5V3Zm3 3h8v4H8V6Zm0 8h1m6 0h1m-8 4h1m6 0h1",
  document: "M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h8",
  chevron: "m9 5 7 7-7 7",
  info: "M12 8h.01M11 12h1v5m0-14a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z",
} as const;
export function Icon({
  name,
  size = 20,
}: {
  name: keyof typeof paths;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
// Original product illustrations. No third-party photographs, generated images, or external assets.
export function DrinkArt({
  product,
  large = false,
}: {
  product: Product;
  large?: boolean;
}) {
  const tea = product.id === "lemon",
    dark = product.id === "americano",
    chocolate = product.id === "chocolate",
    matcha = product.id === "matcha";
  const liquid = tea
    ? "#CF9E45"
    : dark
      ? "#684630"
      : chocolate
        ? "#71503E"
        : matcha
          ? "#7F8D64"
          : product.id === "vanilla"
            ? "#C5A37B"
            : "#BD9169";
  return (
    <div
      className={`drink-art ${large ? "drink-art-large" : ""}`}
      style={{ "--drink": liquid } as CSSProperties}
    >
      <svg viewBox="0 0 180 180" aria-hidden="true">
        <ellipse cx="90" cy="157" rx="40" ry="4" fill="#3D3026" opacity=".09" />
        {tea || dark ? (
          <>
            <path
              d="M55 45h70l-8 103c-1 8-53 8-54 0Z"
              fill="#EEE7DA"
              stroke="#BDB2A1"
              strokeWidth="1.5"
            />
            <path
              d="M59 64h62l-7 81c-1 6-47 6-48 0Z"
              fill={liquid}
              opacity=".94"
            />
            <ellipse
              cx="90"
              cy="64"
              rx="31"
              ry="5"
              fill={dark ? "#7E5D43" : "#E8BC6A"}
            />
            <path
              d="m69 69 14-2 2 14-14 2Zm26 14 14-2 2 14-14 2Z"
              fill="#F9F3E8"
              opacity=".32"
            />
            <path
              d="m109 20-10 53"
              stroke="#665347"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M58 45c0-8 64-8 64 0"
              fill="#F8F3E9"
              stroke="#BDB2A1"
              strokeWidth="1.5"
            />
            {tea && (
              <>
                <circle
                  cx="88"
                  cy="113"
                  r="18"
                  fill="#EDCE7D"
                  stroke="#FAE5A9"
                  strokeWidth="2"
                />
                <circle
                  cx="88"
                  cy="113"
                  r="12"
                  fill="none"
                  stroke="#F8E1A2"
                  strokeWidth="1.4"
                />
                <path
                  d="M76 113h24m-12-12v24"
                  stroke="#F8E1A2"
                  strokeWidth="1.4"
                />
              </>
            )}
          </>
        ) : (
          <>
            <path
              d="M124 66h7c28 0 23 45-5 45h-9"
              fill="none"
              stroke="#C6B6A1"
              strokeWidth="7"
            />
            <path
              d="M51 61h77l-7 72c-2 18-57 18-62 0Z"
              fill="#F3EDE3"
              stroke="#C6B6A1"
              strokeWidth="1.5"
            />
            <ellipse
              cx="89.5"
              cy="61"
              rx="38.5"
              ry="10"
              fill="#E4D8C7"
              stroke="#C6B6A1"
              strokeWidth="1.5"
            />
            <ellipse cx="89.5" cy="61" rx="32" ry="7" fill={liquid} />
            {chocolate ? (
              <path
                d="m79 59 7-2m5 4 6-2m-9 4 5 1"
                stroke="#4B3326"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M90 66c-18-8-14-13-7-9l7 4 7-4c7-4 10 2-7 9Z"
                fill="#FAF3E7"
                opacity=".94"
              />
            )}
            <path
              d="M82 89v25m0-25h17m-17 11h13"
              stroke="#8F7962"
              strokeWidth="1.6"
            />
            <ellipse cx="90" cy="150" rx="48" ry="5" fill="#E9E0D3" />
          </>
        )}
      </svg>
    </div>
  );
}
