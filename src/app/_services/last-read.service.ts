import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { IUser } from '../_models/IUser';
import { ILastReadModel } from '../_models/lastReadModel';

@Injectable({
  providedIn: 'root',
})
export class LastReadService {
  constructor(private store: AngularFirestore) {}

  setLastRead(
    lastReadToId: string,
    reverse: boolean = false,
    loggedUser: IUser
  ) {
    const ref = reverse
      ? this.store.collection(`lastRead`, (ref) =>
          ref
            .where('lastReadForId', '==', loggedUser.id)
            .where('lastReadToId', '==', lastReadToId)
        )
      : this.store.collection(`lastRead`, (ref) =>
          ref
            .where('lastReadForId', '==', lastReadToId)
            .where('lastReadToId', '==', loggedUser.id)
        );

    ref
      .valueChanges()
      .pipe(take(1))
      .subscribe(async (arrayOfItems) => {
        const exists = arrayOfItems.length > 0;

        if (!exists) {
          const refToCreate = this.store.collection('lastRead').doc();

          const docToCreate: ILastReadModel = reverse
            ? {
                lastReadForId: loggedUser.id,
                lastReadToId: lastReadToId,
                lastRead: Date.now(),
                id: refToCreate.ref.id,
              }
            : {
                lastReadForId: lastReadToId,
                lastReadToId: loggedUser.id,
                lastRead: Date.now(),
                id: refToCreate.ref.id,
              };

          await refToCreate.set(docToCreate);
          this.setLastRead(lastReadToId, false, loggedUser);
        } else {
          const doc: any = arrayOfItems[0];

          const docToUpdate = this.store.collection('lastRead').doc(doc.id);
          await docToUpdate.update({ lastRead: Date.now() });
        }
      });
  }

  getLastRead(lastReadToId: string, loggedUser: IUser) {
    const ref = this.store.collection(`lastRead`, (ref) =>
      ref
        .where('lastReadForId', '==', loggedUser.id)
        .where('lastReadToId', '==', lastReadToId)
    );

    return ref.valueChanges().pipe(
      map((arrayOfItems: ILastReadModel[]) => {
        const exists = arrayOfItems.length > 0;
        if (!exists) return null;
        return arrayOfItems[0].lastRead;
      })
    );
  }
  getLastRead1(lastReadToId: string, loggedUser: IUser) {
    const ref = this.store.collection(`lastRead`, (ref) =>
      ref
        .where('lastReadForId', '==', lastReadToId)
        .where('lastReadToId', '==', loggedUser.id)
    );

    return ref.valueChanges().pipe(
      map((arrayOfItems: ILastReadModel[]) => {
        const exists = arrayOfItems.length > 0;
        if (!exists) return null;
        return arrayOfItems[0].lastRead;
      })
    );
  }
}
