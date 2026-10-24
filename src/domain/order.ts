export type Mode = "A" | "B" | "C";
export type Step =
  "start" | "menu" | "options" | "cart" | "review" | "payment" | "complete";
export type Temperature = "" | "HOT" | "ICE";
export interface Product {
  id: string;
  name: string;
  category: "커피" | "논커피" | "티 & 에이드";
  price: number;
  description: string;
  accent: string;
  tag?: string;
}
export interface ItemOptions {
  temperature: Temperature;
  size: "Regular" | "Large";
}
export interface CartItem {
  id: string;
  productId: string;
  temperature: "HOT" | "ICE";
  size: "Regular" | "Large";
  quantity: number;
}
export const products: Product[] = [
  {
    id: "americano",
    name: "아메리카노",
    category: "커피",
    price: 3900,
    description: "고소한 견과와 은은한 초콜릿",
    accent: "#744d38",
    tag: "BEST",
  },
  {
    id: "latte",
    name: "카페 라테",
    category: "커피",
    price: 4800,
    description: "부드러운 우유, 깊은 에스프레소",
    accent: "#b58a61",
    tag: "SIGNATURE",
  },
  {
    id: "vanilla",
    name: "바닐라 라테",
    category: "커피",
    price: 5300,
    description: "마다가스카르 바닐라의 달콤함",
    accent: "#c6a77c",
  },
  {
    id: "matcha",
    name: "제주 말차 라테",
    category: "논커피",
    price: 5600,
    description: "쌉싸름한 말차와 크리미한 우유",
    accent: "#71875c",
  },
  {
    id: "chocolate",
    name: "딥 초콜릿",
    category: "논커피",
    price: 5200,
    description: "진한 카카오의 포근한 풍미",
    accent: "#785245",
  },
  {
    id: "lemon",
    name: "허니 레몬 티",
    category: "티 & 에이드",
    price: 5800,
    description: "싱그러운 레몬에 꿀 한 스푼",
    accent: "#c4a440",
  },
];
export function getUnitPrice(
  item: Pick<CartItem, "productId" | "size">,
): number {
  const p = products.find((p) => p.id === item.productId);
  if (!p) throw new Error("알 수 없는 상품입니다.");
  if (item.size !== "Regular" && item.size !== "Large")
    throw new Error("잘못된 크기입니다.");
  return p.price + (item.size === "Large" ? 500 : 0);
}
export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => {
    if (!Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 9)
      throw new Error("수량은 1~9개여야 합니다.");
    return sum + getUnitPrice(i) * i.quantity;
  }, 0);
}
export function validateOptions(options: ItemOptions): string | null {
  return options.temperature === "HOT" || options.temperature === "ICE"
    ? null
    : "음료 온도를 먼저 선택해 주세요.";
}
export function updateQuantity(
  items: CartItem[],
  id: string,
  delta: number,
): CartItem[] {
  if (!Number.isFinite(delta) || !Number.isInteger(delta))
    throw new Error("잘못된 수량 변경입니다.");
  return items.map((i) =>
    i.id === id
      ? { ...i, quantity: Math.min(9, Math.max(1, i.quantity + delta)) }
      : i,
  );
}
export function formatWon(n: number): string {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}
