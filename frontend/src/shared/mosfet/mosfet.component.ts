import { Component, Input, computed, signal, WritableSignal, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Mosfet } from './models/mosfet';

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
  @Input() label:      string = 'N-Kanal MOSFET (Enhancement)';
  @Input({ required: true })
  mosfet!: Mosfet;
 

  @Output()
propertyChange = new EventEmitter<{
  key: string;
  value: number;
}>();
  
  

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
  get conducting(): boolean { return this.mosfet.state().Vgs >= this.mosfet.state().Vth; }

  // Kanal (Inversionsschicht) – nur sichtbar wenn leitend
  get channelColor(): string {
    return this.conducting ? '#2980b9' : 'none';
  }

  get mosfetValues(): Record<string, [number, string]> {
    console.log('Getting MOSFET values...');
    return this.mosfet.getValues();
  }

changeMosfetProperty(key: string, event: Event) {
  const value = Number((event.target as HTMLInputElement).value);

  this.propertyChange.emit({
    key,
    value
  });
}
  // Beschriftung Gate-Spannung
  get vgsLabel(): string {
    return `Vgs = ${this.mosfet.state().Vgs.toFixed(1)}V  (${this.conducting ? '▶ leitet' : '✕ sperrt'})`;
  }

  // Klick auf Bereich
  selectedRegion = signal<string>('');

  selectRegion(name: string): void {
    this.selectedRegion.set(name);
  }
}
