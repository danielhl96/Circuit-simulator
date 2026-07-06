import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface CircuitComponent {
  symbol: string;
  name: string;
  description: string;
  badge: string;
  count: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'circuit-simulator';

  components = signal<CircuitComponent[]>([
    {
      symbol: 'R',
      name: 'Widerstände',
      description: 'Ohm\'sche Widerstände, Potentiometer und Trimmer.',
      badge: 'badge-primary',
      count: 0,
    },
    {
      symbol: 'C',
      name: 'Kondensatoren',
      description: 'Elektrolyt-, Keramik- und Folienkondensatoren.',
      badge: 'badge-secondary',
      count: 0,
    },
    {
      symbol: 'L',
      name: 'Induktivitäten',
      description: 'Spulen, Transformatoren und induktive Bauteile.',
      badge: 'badge-accent',
      count: 0,
    },
    {
      symbol: 'U',
      name: 'Spannungsquellen',
      description: 'DC-, AC- und gesteuerte Spannungsquellen.',
      badge: 'badge-warning',
      count: 0,
    },
    {
      symbol: 'D',
      name: 'Dioden',
      description: 'Standard-, Zener-, LED- und Schottky-Dioden.',
      badge: 'badge-error',
      count: 0,
    },
    {
      symbol: 'Q',
      name: 'Transistoren',
      description: 'BJT, MOSFET und JFET-Transistoren.',
      badge: 'badge-info',
      count: 0,
    },
  ]);

  simulationStatus = signal<'idle' | 'running' | 'done'>('idle');
  totalComponents = signal<number>(0);
  totalConnections = signal<number>(0);

  addComponent(index: number): void {
    const updated = [...this.components()];
    updated[index] = { ...updated[index], count: updated[index].count + 1 };
    this.components.set(updated);
    this.totalComponents.update((n: number) => n + 1);
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
