import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DescriptionLimiter } from 'src/app/_utilities/descriptionLimiter.utility';
import { AuthService } from '../../_services/auth.service';
import { LoadingService } from '../../_services/loading.service';
import { ToastrService } from '../../_services/toastr.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  isUserNameAvailable = null;
  descriptionLimit = 200;
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }

  ngOnInit(): void {}

  checkIfUserNameAvailable(event: any) {
    const userName = event.target.value;
    this.subscriptions.push(
      this.authService
        .checkIfUserNameAvailable(userName)
        .subscribe((isAvailable) => {
          this.isUserNameAvailable = isAvailable;
        })
    );
  }

  async onRegister(form: NgForm) {
    try {
      // if (!this.isUserNameAvailable)
      //   return this.toastr.showError('This username is already taken');

      let { displayName, email, password, confirmPassword, description } =
        form.value;

      if (description) {
        const descriptionLimiter = new DescriptionLimiter(description);
        description = descriptionLimiter.GetDescription();
      }

      if (password != confirmPassword)
        return this.toastr.showError('Parolele sunt diferite');

      this.loadingService.setLoading();
      const success = await this.authService.register({
        displayName,
        email,
        password,
        description,
      });

      if (success) {
        this.loadingService.offLoading();
        this.toastr.showSuccess('Account registered succesfully');
        this.router.navigate(['/chat']);
      }
      this.loadingService.offLoading();
    } catch (error) {
      this.loadingService.offLoading();
    }
  }
}
