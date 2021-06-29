import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { IMessage } from '../_models/IMessage';
import { IUser } from '../_models/IUser';
import { AuthService } from './auth.service';
import { LastReadService } from './last-read.service';

import { ToastrService } from './toastr.service';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  userTalkingTo$ = new BehaviorSubject<IUser>(null);

  constructor(
    private store: AngularFirestore,
    private toastrService: ToastrService,
    private lastReadService: LastReadService
  ) {}

  currentUserTalkingTo: IUser = null;
  selectUserTalkingTo(user: IUser) {
    if (!user) {
      this.currentUserTalkingTo = null;
      this.userTalkingTo$.next(null);
      return;
    }

    if (this.currentUserTalkingTo && this.currentUserTalkingTo.id === user.id) {
      this.currentUserTalkingTo = null;
      this.userTalkingTo$.next(null);
    } else {
      this.currentUserTalkingTo = user;
      this.userTalkingTo$.next(user);
    }
  }

  addMessage(message: IMessage, loggedUser: IUser) {
    const refMsg = this.store
      .doc(`users/${loggedUser.id}`)
      .collection('messages')
      .doc().ref;

    message.id = refMsg.id;
    return from(
      refMsg
        .set(message)
        .then((success) => {
          return of(true);
        })
        .catch((e) => {
          this.toastrService.showError(e);
          return of(false);
        })
    );
  }

  getMessages(
    userIdTaklingTo: string,
    limit: number = 5,
    loggedUser: IUser
  ): Observable<IMessage[]> {
    return this.store
      .doc<IMessage[]>(`users/${userIdTaklingTo}`)
      .collection('messages', (ref) =>
        ref
          .where('userIdTo', '==', loggedUser.id)
          .orderBy('time', 'desc')
          .limit(limit)
      )
      .valueChanges()
      .pipe(
        tap(() => {
          this.lastReadService.setLastRead(userIdTaklingTo, true, loggedUser);
        }),
        switchMap((messagesFromUser: IMessage[]) => {
          return this.store
            .doc<IMessage[]>(`users/${loggedUser.id}`)
            .collection('messages', (ref) =>
              ref
                .where('userIdTo', '==', userIdTaklingTo)
                .orderBy('time', 'desc')
                .limit(limit)
            )
            .valueChanges()
            .pipe(
              map((messagesFromMe: IMessage[]) => {
                const messages = [...messagesFromUser, ...messagesFromMe].sort(
                  (a, b) => a.time - b.time
                );
                return messages;
              })
            );
        })
      );
  }

  getMessagesFrom(
    userIdTaklingTo: string,
    loggedUser: IUser
  ): Observable<IMessage[]> {
    return this.store
      .doc<IMessage[]>(`users/${userIdTaklingTo}`)
      .collection('messages', (ref) =>
        ref.where('userIdTo', '==', loggedUser.id)
      )
      .valueChanges()
      .pipe(
        map((messages: IMessage[]) => {
          return messages.sort((a, b) => a.time - b.time);
        })
      );
  }
}
