export class CircuitComponent {
  constructor(
    public name: string,
    public description: string,
    public svgSrc: string,
    public symbol: string,
    public badge: string,
    public count: number = 0
  ) {}
}
