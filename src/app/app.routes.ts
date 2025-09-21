import { Routes } from '@angular/router';
import { GameComponent } from './pages/game/game.component';
import { MenuComponent } from './pages/menu/menu.component';
import { PairsComponent } from './pages/pairs/pairs.component';
import { SolutionComponent } from './pages/solution/solution.component';
import { gameConfiguredGuard } from './guards/game-configured.guard';

export const routes: Routes = [
    { path: 'legacy', component: GameComponent },
    { path: '', component: MenuComponent },
    { path: 'pairs', component: PairsComponent, canActivate: [gameConfiguredGuard] },
    { path: 'solution', component: SolutionComponent, canActivate: [gameConfiguredGuard] },
    { path: '**', redirectTo: '' }
];
