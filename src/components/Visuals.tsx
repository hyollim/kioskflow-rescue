import type { Product } from "../domain/order";
export function Icon({
  name,
  size = 20,
}: {
  name:
    | "arrow"
    | "back"
    | "check"
    | "bag"
    | "shield"
    | "spark"
    | "chart"
    | "reset"
    | "external";
  size?: number;
}) {
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
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
export function DrinkArt({
  product,
  large = false,
}: {
  product: Product;
  large?: boolean;
}) {
  return (
    <div
      className={`drink-art ${large ? "drink-art-large" : ""}`}
      style={{ "--drink": product.accent } as React.CSSProperties}
    >
      <svg viewBox="0 0 160 160" aria-hidden="true">
        <ellipse
          cx="80"
          cy="145"
          rx="39"
          ry="7"
          fill="currentColor"
          opacity=".12"
        />
        <path d="M47 49h66l-8 83c-1 8-49 8-50 0Z" fill="#fffaf0" />
        <path d="M50 70h60l-6 61c-1 7-47 7-48 0Z" fill={product.accent} />
        <path d="m53 78 54 10-2 30-49-10Z" fill="#fffaf0" opacity=".9" />
        <circle cx="80" cy="100" r="11" fill={product.accent} />
        <path d="m77 99 3-4 4 5-4 5Z" fill="#fffaf0" />
        <path d="M44 49c0-9 72-9 72 0v7H44Z" fill="#234b43" />
        <path d="M51 41h58l4 7H47Z" fill="#356358" />
        <path
          d="M72 17c-8 8 9 10 1 17m14-21c-8 9 8 12 0 19"
          stroke="#69867b"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
