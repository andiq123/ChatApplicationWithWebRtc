import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { IIsTypingModel } from '../_models/isTypingModel';

@Injectable({
  providedIn: 'root',
})
export class OnTypingService {
  constructor(private fireStore: AngularFirestore) {}

  async setIsTyping(
    whoIsTypingId: string,
    whoWatchesId: string,
    status: boolean
  ) {
    const ref = this.fireStore.collection('isTyping', (ref) =>
      ref
        .where('idWhoIsTyping', '==', whoIsTypingId)
        .where('idWhoWatches', '==', whoWatchesId)
        .limit(1)
    );

    ref
      .valueChanges()
      .pipe(take(1))
      .subscribe(async (arrayOfItems) => {
        const exists = arrayOfItems.length > 0;

        if (!exists) {
          const refToCreate = this.fireStore.collection('isTyping').doc();
          const docToCreate: IIsTypingModel = {
            isTyping: false,
            idWhoIsTyping: whoIsTypingId,
            idWhoWatches: whoWatchesId,
            id: refToCreate.ref.id,
          };
          await refToCreate.set(docToCreate);
        } else {
          const doc: any = arrayOfItems[0];

          const docToUpdate = this.fireStore.collection('isTyping').doc(doc.id);
          docToUpdate.update({ isTyping: status });
        }
      });
  }

  listenForTypingChanges(whoIsTypingId: string, whoWatchesId: string) {
    return this.fireStore
      .collection('isTyping', (ref) =>
        ref
          .where('idWhoIsTyping', '==', whoIsTypingId)
          .where('idWhoWatches', '==', whoWatchesId)
      )
      .valueChanges()
      .pipe(map((x) => x.map((x: any) => x.isTyping)[0]));
  }
}
