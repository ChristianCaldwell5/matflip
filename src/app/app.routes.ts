import { Routes } from '@angular/router';
import { GameComponent } from './pages/game/game.component';
import { MenuComponent } from './pages/menu/menu.component';
import { PairsComponent } from './pages/pairs/pairs.component';
import { SolutionComponent } from './pages/solution/solution.component';
import { gameConfiguredGuard } from './guards/game-configured.guard';
import { AuthRedirectComponent } from './pages/auth-redirect/auth-redirect.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { TermsComponent } from './pages/terms/terms.component';
import { StatsComponent } from './pages/stats/stats.component';
import { CustomizeComponent } from './pages/customize/customize.component';
import { ProgressionComponent } from './pages/progression/progression.component';
import { StoreComponent } from './pages/store/store.component';

export const routes: Routes = [
    { path: 'legacy', component: GameComponent },
    { path: '', component: MenuComponent },
    { path: 'pairs', component: PairsComponent, canActivate: [gameConfiguredGuard] },
    { path: 'solution', component: SolutionComponent, canActivate: [gameConfiguredGuard] },
    { path: 'login', component: AuthRedirectComponent },
    { path: 'privacy', component: PrivacyComponent },
    { path: 'terms', component: TermsComponent },
    { path: 'stats', component: StatsComponent },
    { path: 'customize', component: CustomizeComponent },
    { path: 'progression', component: ProgressionComponent},
    { path: 'store', component: StoreComponent },
    { path: '**', redirectTo: '' }
];
