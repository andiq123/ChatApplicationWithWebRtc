import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EditProfileService {
  show = new BehaviorSubject<boolean>(false);

  constructor() {}

  open() {
    this.show.next(true);
  }

  close() {
    this.show.next(false);
  }
}
