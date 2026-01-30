import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProfile } from '../../model/interfaces/user/user-profile';
import { UserService } from '../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stats',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent {

  currentUser$: Observable<UserProfile | null>;
  // Controls visibility of the "Pairs - All" stats section
  showPairsAllStats = true;
  showSolutionAllStats = true;
  showDailyStats = true;

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.currentUser$ = this.userService.user$;
  }

  goToMenu(): void {
    this.router.navigate(['/']);
  }

}
