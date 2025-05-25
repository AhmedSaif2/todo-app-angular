import { Component, inject, OnInit } from '@angular/core';
import { FirestoreService } from '../../core/services/firestore.service';
import { AuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  authService = inject(AuthService);
  ngOnInit() {
    this.authService.user.subscribe((user) => (this.isAuthenticated = !!user));
  }
  onLogout() {
    this.authService.logout();
  }
}
