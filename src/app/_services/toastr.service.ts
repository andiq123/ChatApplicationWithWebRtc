import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastrService {
  onShowSuccess = new Subject<string>();
  onShowError = new Subject<string>();
  onShowWarning = new Subject<string>();
  
  constructor() {}

  showSuccess(message: string) {
    this.onShowSuccess.next(message);
  }

  showError(message: string) {
    this.onShowError.next(message);
  }

  showWarning(message: string) {
    this.onShowWarning.next(message);
  }
}
