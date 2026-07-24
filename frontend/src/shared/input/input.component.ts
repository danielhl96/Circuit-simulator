import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [NgClass],
  templateUrl: './input.component.html',
  styles: ``
})
export class InputComponent {
    @Input() setValue: string = "";
    @Input() setPlaceholder: string = "";
    @Input() setBorder: string = "";
    @Output() onInputEvent = new EventEmitter<Event>();
    @Output() onErrorEvent = new EventEmitter<boolean>();
    @Input() setError: string = "";

    getErrorMessage(event: Event): string {
        const target = event.target as HTMLInputElement | null;
        const raw = target ? target.value : '';
        if (isNaN(Number(raw))) {
            this.setError = 'Invalid value';
        } else {
            this.setError = '';
        }
        this.onErrorEvent.emit(this.setError !== '');
        return this.setError;
    }

    onInput(event: Event): void {
        this.onInputEvent.emit(event);
        this.getErrorMessage(event);
    }
}
