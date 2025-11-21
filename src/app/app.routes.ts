import { Routes } from '@angular/router';
import { GameComponent } from './pages/game/game.component';
import { MenuComponent } from './pages/menu/menu.component';
import { PairsComponent } from './pages/pairs/pairs.component';
import { SolutionComponent } from './pages/solution/solution.component';
import { gameConfiguredGuard } from './guards/game-configured.guard';
import { AuthRedirectComponent } from './pages/auth-redirect/auth-redirect.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { TermsComponent } from './pages/terms/terms.component';

export const routes: Routes = [
    { path: 'legacy', component: GameComponent },
    { path: '', component: MenuComponent },
    { path: 'pairs', component: PairsComponent, canActivate: [gameConfiguredGuard] },
    { path: 'solution', component: SolutionComponent, canActivate: [gameConfiguredGuard] },
    { path: 'login', component: AuthRedirectComponent },
    { path: 'privacy', component: PrivacyComponent },
    { path: 'terms', component: TermsComponent },
    { path: '**', redirectTo: '' }
];
