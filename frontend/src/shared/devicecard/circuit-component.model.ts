export interface CircuitComponent {
  symbol: string;
  svgSrc?: string;  // optionaler Pfad zu einem SVG aus public/
  name: string;
  description: string;
  badge: string;
  count: number;
}
