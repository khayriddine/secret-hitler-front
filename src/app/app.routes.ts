import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/landing/landing.module').then((m) => m.LandingModule),
  },
  {
    path: 'lobby/:code',
    loadChildren: () =>
      import('./pages/lobby/lobby.module').then((m) => m.LobbyModule),
  },
  {
    path: 'game/:id',
    loadChildren: () =>
      import('./pages/game/game.module').then((m) => m.GameModule),
  },
  {
    path: 'results/:id',
    loadChildren: () =>
      import('./pages/result/result.module').then((m) => m.ResultModule),
  },
];
