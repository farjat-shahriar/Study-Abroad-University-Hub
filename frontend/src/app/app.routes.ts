import { Routes } from '@angular/router';
import { CountryPage } from './pages/country-page/country-page';
import { ComingSoon } from './pages/coming-soon/coming-soon';

export const routes: Routes = [
  { path: '', redirectTo: '/country/germany', pathMatch: 'full' },

  // ── Europe (Schengen) ──
  { path: 'country/germany',        component: CountryPage },
  { path: 'country/austria',        component: CountryPage },
  { path: 'country/belgium',        component: CountryPage },
  { path: 'country/bulgaria',       component: CountryPage },
  { path: 'country/croatia',        component: CountryPage },
  { path: 'country/czech-republic', component: CountryPage },
  { path: 'country/denmark',        component: CountryPage },
  { path: 'country/estonia',        component: CountryPage },
  { path: 'country/finland',        component: CountryPage },
  { path: 'country/france',         component: CountryPage },
  { path: 'country/greece',         component: CountryPage },
  { path: 'country/hungary',        component: CountryPage },
  { path: 'country/iceland',        component: CountryPage },
  { path: 'country/italy',          component: CountryPage },
  { path: 'country/latvia',         component: CountryPage },
  { path: 'country/liechtenstein',  component: CountryPage },
  { path: 'country/lithuania',      component: CountryPage },
  { path: 'country/luxembourg',     component: CountryPage },
  { path: 'country/malta',          component: CountryPage },
  { path: 'country/netherlands',    component: CountryPage },
  { path: 'country/norway',         component: CountryPage },
  { path: 'country/poland',         component: CountryPage },
  { path: 'country/portugal',       component: CountryPage },
  { path: 'country/romania',        component: CountryPage },
  { path: 'country/slovakia',       component: CountryPage },
  { path: 'country/slovenia',       component: CountryPage },
  { path: 'country/spain',          component: CountryPage },
  { path: 'country/sweden',         component: CountryPage },
  { path: 'country/switzerland',    component: CountryPage },

  // ── United Kingdom ──
  { path: 'country/uk',             component: CountryPage },
  { path: 'country/wales',          component: CountryPage },

  // ── Ireland ──
  { path: 'country/ireland',        component: CountryPage },

  // ── United States ──
  { path: 'country/usa',            component: CountryPage },

  // ── Oceania ──
  { path: 'country/australia',      component: CountryPage },
  { path: 'country/new-zealand',    component: CountryPage },

  // ── Asia ──
  { path: 'country/malaysia',       component: CountryPage },
  { path: 'country/japan',          component: CountryPage },
  { path: 'country/south-korea',    component: CountryPage },

  // Fallback
  { path: 'country/:country', component: ComingSoon },
  { path: '**', redirectTo: '/country/germany' },
];
