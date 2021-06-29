import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  isLoading = new Subject<boolean>();
  constructor() {}

  setLoading() {
    this.isLoading.next(true);
  }

  offLoading() {
    this.isLoading.next(false);
  }
}
