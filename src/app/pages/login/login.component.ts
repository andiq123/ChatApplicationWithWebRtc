import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ILoginModel } from 'src/app/_models/Auth/login';
import { IUser } from '../../_models/IUser';
import { AuthService } from '../../_services/auth.service';
import { LoadingService } from '../../_services/loading.service';
import { ToastrService } from '../../_services/toastr.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {}

  async onLogin(form: NgForm) {
    try {
      const { email, password } = form.value;
      this.loadingService.setLoading();

      const loginModel: ILoginModel = { email, password };
      const success = await this.authService.login(loginModel);

      if (success) {
        this.toastr.showSuccess('Logged in Succesfully');
        this.router.navigate(['/chat']);
      }

      this.loadingService.offLoading();
    } catch (error) {
      this.loadingService.offLoading();
    }
  }

  async onLoginWithGoogle() {
    try {
      this.loadingService.setLoading();

      const success = await this.authService.signInGoogle();
      if (success) {
        this.loadingService.offLoading();
        this.toastr.showSuccess('Logged in Succesfully');
        this.router.navigate(['/chat']);
      }
    } catch (error) {
      this.loadingService.offLoading();
    }
  }
}
