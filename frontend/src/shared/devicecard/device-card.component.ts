import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CircuitComponent } from './circuit-component.model';

@Component({
  selector: 'app-device-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './device-card.component.html',
})
export class DeviceCardComponent {
  @Input({ required: true }) component!: CircuitComponent;
  @Output() add = new EventEmitter<void>();

  onAdd(): void {
    this.add.emit();
  }
}
