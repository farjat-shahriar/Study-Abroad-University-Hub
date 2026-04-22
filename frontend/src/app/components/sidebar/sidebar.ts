import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Country, SCHENGEN_COUNTRIES } from '../../models/country.model';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Output() sidebarToggled = new EventEmitter<boolean>();

  activeCountries: Country[] = SCHENGEN_COUNTRIES.filter((c) => c.isActive);
  upcomingCountries: Country[] = SCHENGEN_COUNTRIES.filter((c) => !c.isActive);
  isCollapsed = false;

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggled.emit(this.isCollapsed);
  }
}
