import { Component, Input, computed, signal, WritableSignal, EventEmitter, Output,ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Mosfet } from './models/mosfet';
import { CharacteristicCurvesComponent } from '../characteristic-curves/characteristic-curves.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-mosfet-2d',
  standalone: true,
  imports: [CommonModule, CharacteristicCurvesComponent,ButtonComponent],
  templateUrl: './mosfet.component.html',
})
export class MosfetComponent {
  // ── Eingangsparameter (von außen steuerbar) ──────────────────
  @Input() gateLength: number = 150;  // px Breite des Gate/Kanal-Bereichs
  @Input() gateWidth:  number = 38;   // px Höhe des Gate-Metalls
  @Input() label:      string = 'N-Kanal MOSFET (Enhancement)';
  @Input({ required: true })
  mosfet!: Mosfet;
 @ViewChild(CharacteristicCurvesComponent)
  curve!: CharacteristicCurvesComponent;
  @Output()
propertyChange = new EventEmitter<{
  key: string;
  value: number;
}>();
  
  // ── Abgeleitete Geometrie ────────────────────────────────────
  // SVG-Gesamtbreite fest, Gate zentriert
  readonly svgW = 700;
  readonly svgH = 420;
  readonly sdWidth  =70;  // Source/Drain Breite px
  readonly subY     = 240;  // Substrat y-Start
  readonly subH     = 140;
  private _showEditModal: WritableSignal<boolean> = signal(false);

  get gateX():   number { return (this.svgW - this.gateLength) / 2; }
  get gateEndX(): number { return this.gateX + this.gateLength; }

  // Depletionszone: so breit wie Gate, 80px hoch wenn Vgs < Vth
  get deplH():   number { return this.conducting ? 20 : 80; }
  get deplY():   number { return this.subY - this.deplH + 40; }

  get showEditModal(): boolean {
    return this._showEditModal();
  }

  // Leitend: N-Kanal Vgs >= Vth, P-Kanal Vgs <= Vth (Vth negativ)
  get conducting(): boolean {
    const { Vgs, Vth, Type } = this.mosfet.state();
    return Type === 'N' ? Vgs >= Vth : Vgs <= Vth;
  }

  // Kanal (Inversionsschicht) – nur sichtbar wenn leitend
  get channelColor(): string {
    return this.conducting ? '#2980b9' : 'none';
  }

  set showEditModal(value: boolean) {
    this._showEditModal.set(value);
  }

  get mosfetValues(): Record<string, [number, string]> {
    console.log('Getting MOSFET values...');
    return this.mosfet.getValues();
  }

  get simulationResultsByVgs(): { Vgs: number[]; Id_Vgs: number[] } {
    return this.mosfet.getSimulationResultsByVgs();
  }

  get mosfetType(): string {
    return this.mosfet.getType();
  }

  set mosfetType(type: string) {
    this.mosfet.setType(type);
  }

  get simulationResultsByVds(): { Vds: number[]; Id_Vds: number[] } {
    return this.mosfet.getSimulationResultsByVds();
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
