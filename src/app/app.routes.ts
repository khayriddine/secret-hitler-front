import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { GameComponent } from './pages/game/game.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'lobby/:code', component: LobbyComponent },
  { path: 'game/:code', component: GameComponent },
  // etc.
];
