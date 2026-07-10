import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DeviceCardComponent } from '../shared/devicecard/device-card.component';
import { CircuitComponent } from '../shared/devicecard/circuit-component.model';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { MosfetComponent } from '../shared/mosfet/mosfet.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DeviceCardComponent, NavbarComponent, MosfetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'circuit-simulator';

  components = signal<CircuitComponent[]>([
    
    {
      symbol: 'Q',
      svgSrc: 'mosfet-symbol.svg',
      name: 'Transistoren',
      description: 'BJT, MOSFET und JFET-Transistoren.',
      badge: 'badge-info',
      count: 0,
    },
  ]);

  simulationStatus = signal<'idle' | 'running' | 'done'>('idle');
  addedComponents = signal<CircuitComponent[]>([]);
  totalComponents = signal<number>(0);
  totalConnections = signal<number>(0);
  libOpen = signal<boolean>(true);

  toggleLib(): void {
    this.libOpen.update((open: boolean) => !open);
  }

  addComponent(index: number): void {
    this.addedComponents.update((list: CircuitComponent[]) => [...list, { ...this.components()[index], count: 1 }]);  
    this.totalComponents.update((n: number) => n + 1);
  }

  removeComponent(addedIndex: number): void {
    const list = this.addedComponents();
    if (addedIndex < 0 || addedIndex >= list.length) return;

    const removed = list[addedIndex];

    // addedComponents: Element an Position entfernen
    this.addedComponents.update((l: CircuitComponent[]) => [
      ...l.slice(0, addedIndex),
      ...l.slice(addedIndex + 1),
    ]);
    this.totalComponents.update((n: number) => n - 1);
  }

  startSimulation(): void {
    if (this.totalComponents() === 0) return;
    this.simulationStatus.set('running');
    setTimeout(() => this.simulationStatus.set('done'), 1500);
  }

  resetCircuit(): void {
    const reset = this.components().map((c: CircuitComponent) => ({ ...c, count: 0 }));
    this.components.set(reset);
    this.totalComponents.set(0);
    this.totalConnections.set(0);
    this.simulationStatus.set('idle');
  }
}
