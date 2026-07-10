import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mosfet-2d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mosfet.component.html',
})
export class MosfetComponent {
  // ── Eingangsparameter (von außen steuerbar) ──────────────────
  @Input() gateLength: number = 300;  // px Breite des Gate/Kanal-Bereichs
  @Input() gateWidth:  number = 38;   // px Höhe des Gate-Metalls
  @Input() Vgs:        number = 0;    // V  (0 = sperrt, >Vth = leitet)
  @Input() Vth:        number = 1.0;  // V  Schwellspannung
  @Input() label:      string = 'N-Kanal MOSFET (Enhancement)';

  // ── Abgeleitete Geometrie ────────────────────────────────────
  // SVG-Gesamtbreite fest, Gate zentriert
  readonly svgW = 700;
  readonly svgH = 420;
  readonly sdWidth  = 140;  // Source/Drain Breite px
  readonly subY     = 240;  // Substrat y-Start
  readonly subH     = 140;

  get gateX():   number { return (this.svgW - this.gateLength) / 2; }
  get gateEndX(): number { return this.gateX + this.gateLength; }

  // Depletionszone: so breit wie Gate, 80px hoch wenn Vgs < Vth
  get deplH():   number { return this.conducting ? 20 : 80; }
  get deplY():   number { return this.subY - this.deplH + 40; }

  // Leitend wenn Vgs >= Vth
  get conducting(): boolean { return this.Vgs >= this.Vth; }

  // Kanal (Inversionsschicht) – nur sichtbar wenn leitend
  get channelColor(): string {
    return this.conducting ? '#2980b9' : 'none';
  }

  // Beschriftung Gate-Spannung
  get vgsLabel(): string {
    return `Vgs = ${this.Vgs.toFixed(1)}V  (${this.conducting ? '▶ leitet' : '✕ sperrt'})`;
  }

  // Klick auf Bereich
  selectedRegion = signal<string>('');

  selectRegion(name: string): void {
    this.selectedRegion.set(name);
  }
}
