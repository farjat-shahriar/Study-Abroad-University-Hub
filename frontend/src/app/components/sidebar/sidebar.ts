import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RegionGroup, REGION_GROUPS } from '../../models/country.model';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Output() sidebarToggled = new EventEmitter<boolean>();

  regionGroups: RegionGroup[] = REGION_GROUPS;
  isCollapsed = false;

  // Track which groups are expanded; Schengen collapsed by default to save space
  expandedGroups: Record<string, boolean> = {
    schengen: false,
    'uk-group': true,
    ireland: true,
    usa: true,
    oceania: true,
    asia: true,
  };

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggled.emit(this.isCollapsed);
  }

  toggleGroup(slug: string): void {
    this.expandedGroups[slug] = !this.expandedGroups[slug];
  }

  isGroupExpanded(slug: string): boolean {
    return !!this.expandedGroups[slug];
  }

  isSingleCountryGroup(group: RegionGroup): boolean {
    return group.countries.length === 1;
  }
}
