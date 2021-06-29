import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { IUser } from '../_models/IUser';

@Injectable({
  providedIn: 'root',
})
export class IdleDetectorService implements OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(private fireStore: AngularFirestore) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }

  async setOnline(loggedUser: IUser) {
    const user = this.fireStore.collection('users').doc(loggedUser.id).ref;
    await user.update({ lastActive: Date.now() });
  }
}
