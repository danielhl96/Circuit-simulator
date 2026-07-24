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

    onInput(event: Event): void {
        this.onInputEvent.emit(event);
    }   
}
