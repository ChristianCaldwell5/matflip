import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user/user.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-redirect',
  imports: [MatProgressSpinnerModule],
  templateUrl: './auth-redirect.component.html',
  styleUrls: ['./auth-redirect.component.scss']
})
export class AuthRedirectComponent implements OnInit {

  fetching = true;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userService.ensureUserLoaded().pipe(
      finalize(() => {
        this.fetching = false;
        this.router.navigate(['/']);
      })
    ).subscribe({
      next: (profile) => {
        if (profile) {
          console.log("User profile retrieved:", profile);
        } else {
          console.log("No user profile found");
        }
      },
      error: (error) => {
        console.error("Error retrieving user profile:", error);
      }
    });
  }

}
