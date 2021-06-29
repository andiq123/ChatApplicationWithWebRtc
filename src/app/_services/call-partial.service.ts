import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Call } from '../_enums/call.enum';
import { AuthService } from './auth.service';
import { CallStateService } from './call-state.service';
import { RingtoneService } from './ringtone.service';
import { ToastrService } from './toastr.service';

@Injectable({
  providedIn: 'root',
})
export class CallPartialService implements OnDestroy {
  subscriptions: Subscription[] = [];

  myUserId: string;

  constructor(
    private store: AngularFirestore,
    private authService: AuthService,
    private ringToneService: RingtoneService,
    private toastrService: ToastrService,
    private callStateService: CallStateService
  ) {
    this.authService.currentUser.subscribe((user) => {
      if (user) this.myUserId = user.id;
    });

    this.subscriptions.push(
      this.listenWhenSomeoneCallsYou().subscribe((id: string) => {
        if (id) {
          this.ringToneService.play();
          this.callStateService.setSomeOneCallsYou(id);
        }
      })
    );
  }

  listenWhenSomeoneCallsYou(): Observable<string> {
    const callDoc = this.store.collection('calls');

    return callDoc.snapshotChanges().pipe(
      map((actions) => {
        for (let i = 0; i < actions.length; i++) {
          const el = actions[i];
          if (el.type !== 'added') return;
          const data: any = el.payload.doc.data();
          return data && data.userToCallId === this.myUserId ? data.id : null;
        }
      })
    );
  }

  listenWhenSomeoneHungsUp(id: string): Observable<string> {
    return new Observable<string>((observer) => {
      const callDoc = this.store.collection('calls').doc(id);
      this.subscriptions.push(
        callDoc.snapshotChanges().subscribe((action: any) => {
          if (action.type !== 'removed') return;
          observer.next(id);
        })
      );
    });
  }

  async hangUp(id: string) {
    try {
      this.ringToneService.stop();
      if (id) {
        const callDoc = this.store.collection(`calls`).doc(id);
        await callDoc.delete();
      } else {
        this.toastrService.showError(
          'Error deleting the call, no offer id from call partial'
        );
      }
    } catch (e) {
      console.log(e);
    }

    this.callStateService.$CallState.pipe(take(1)).subscribe((state) => {
      if (state == Call.Idle || state == Call.SomeOneCallsYou) {
        this.callStateService.setIdle();
      } else {
        this.callStateService.setCallRefused();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }
}
