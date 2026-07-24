import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './button.component.html',
  styles: ``
})
export class ButtonComponent {
  @Input() setLoading: boolean = false;
  @Input() setBorder: string = "";
  @Input() disabled: boolean = false;
  @Output() onClickEvent = new EventEmitter<Event>();

  onClick(event: Event): void {
    if (!this.disabled) {
      this.onClickEvent.emit(event);
    }
  }
}
