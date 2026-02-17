import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { UserProfile } from '../../model/interfaces/user/user-profile';
import { Observable } from 'rxjs';
import { UserService } from '../../services/user/user.service';
import { CatalogBreakdown } from '../../model/interfaces/customization';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-progression',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './progression.component.html',
  styleUrls: ['./progression.component.scss']
})
export class ProgressionComponent implements OnInit {

  currentUser$: Observable<UserProfile | null>;
  catalogBreakdown: Signal<CatalogBreakdown | null> = signal(null);

  constructor(
    private userService: UserService,
    private catalogService: CatalogService,
    private router: Router
  ) { 
    this.currentUser$ = this.userService.user$;
    this.catalogBreakdown = this.catalogService.catalogBreakdown;
    console.log('Catalog Breakdown:', this.catalogBreakdown());
  }

  ngOnInit(): void {
    console.log('Catalog Breakdown:', this.catalogBreakdown());
  }

  goToMenu(): void {
    this.router.navigate(['/']);
  }

}
