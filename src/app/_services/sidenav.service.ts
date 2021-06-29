import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidenavService {
  public show = new BehaviorSubject<boolean>(true);
  constructor() {}

  public toggle() {
    this.show.next(!this.show.getValue());
  }
}
