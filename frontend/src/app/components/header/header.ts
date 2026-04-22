import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { filter, map } from 'rxjs';
import { SCHENGEN_COUNTRIES } from '../../models/country.model';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly router = inject(Router);

  activeCountry = 'Germany';
  activeFlag = '🇩🇪';

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map((e) => {
          const match = e.urlAfterRedirects.match(/\/country\/(.+)/);
          return match ? match[1] : 'germany';
        })
      )
      .subscribe((slug) => {
        const found = SCHENGEN_COUNTRIES.find((c) => c.slug === slug);
        this.activeCountry = found?.name || 'Germany';
        this.activeFlag = found?.flag || '🇩🇪';
      });
  }
}
