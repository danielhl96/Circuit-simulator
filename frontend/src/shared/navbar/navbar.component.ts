import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
})

export class NavbarComponent {
  @Output() libToggle = new EventEmitter<void>();

  setDarkMode(): void {
    document.documentElement.classList.toggle('dark');
  }

  get isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark');
  }

  onLibToggle(): void {
    this.libToggle.emit();
  }
}