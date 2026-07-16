import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DeviceCardComponent } from '../shared/devicecard/device-card.component';
import { CircuitComponent } from '../shared/devicecard/circuit-component.model';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { MosfetComponent } from '../shared/mosfet/mosfet.component';
import { Mosfet } from '../shared/mosfet/models/mosfet';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DeviceCardComponent, NavbarComponent, MosfetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'circuit-simulator';
  simulationStatus = signal<'idle' | 'running' | 'done'>('idle');
  addedComponents = signal<CircuitComponent[]>([]);
  totalComponents = signal<number>(0);
  totalConnections = signal<number>(0);
  libOpen = signal<boolean>(true);

  components = signal<CircuitComponent[]>([
    {
      symbol: 'Q',
      svgSrc: 'mosfet-symbol.svg',
      name: 'Transistoren',
      description: 'BJT, MOSFET und JFET-Transistoren.',
      badge: 'badge-info',
      id: this.addedComponents().length + 1,
      device:     new Mosfet()
    },
  ]);


  changeMosfetProperty(
  mosfet: Mosfet,
  change: {key: string, value: number}
) {
  mosfet.state.update(m => ({
    ...m,
    [change.key]: change.value
  }));
}
 
  toggleLib(): void {
    this.libOpen.update((open: boolean) => !open);
  }

  addComponent(index: number): void {
    this.addedComponents.update((list: CircuitComponent[]) => [...list, { ...this.components()[index], count: 1, device: new Mosfet() }]);  
    this.totalComponents.update((n: number) => n + 1);
  }

  removeComponent(addedIndex: number): void {
    const list = this.addedComponents();
    if (addedIndex < 0 || addedIndex >= list.length) return;
    const component = list[addedIndex];
    if (component.device instanceof Mosfet) {
      (component.device as Mosfet).deleteMosfet();
    }
    // addedComponents: Element an Position entfernen
    this.addedComponents.update((l: CircuitComponent[]) =>  [
      ...l.slice(0, addedIndex),
      ...l.slice(addedIndex + 1),
    ] );
    this.totalComponents.update((n: number) => n - 1);
  }

startSimulation(index: number): void {
  console.log('Simulation gestartet');

  this.addedComponents()[index].device.update();
  this.simulationStatus.set('running');
}
}
