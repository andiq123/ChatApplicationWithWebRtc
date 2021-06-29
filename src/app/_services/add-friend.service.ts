import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AddFriendService {
  show = new BehaviorSubject<boolean>(false);

  constructor() {}

  open() {
    this.show.next(true);
  }
  close() {
    this.show.next(false);
  }
}
