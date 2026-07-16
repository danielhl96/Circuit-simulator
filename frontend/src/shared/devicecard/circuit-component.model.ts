export class CircuitComponent {
  constructor(
    public name: string,
    public description: string,
    public svgSrc: string,
    public symbol: string,
    public badge: string,
    public id: number = 0,
    public device:any = null,  // Optional: Store the actual device instance (e.g., Mosfet) for further calculations
  ) {}
}
