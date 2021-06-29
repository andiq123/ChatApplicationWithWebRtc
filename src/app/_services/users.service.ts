import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { IUser } from '../_models/IUser';
import { IUserWithDistance } from '../_models/IUserWithDistance';
import { GeolocationService } from './geolocation.service';
import { ToastrService } from './toastr.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  friends: string[] = [];

  constructor(
    private ang: AngularFirestore,
    private geolocationService: GeolocationService,
    private toastrService: ToastrService
  ) {}

  //generals
  getUsersWithDistance(
    name: string = '',
    userLoggedIn: IUser
  ): Observable<IUserWithDistance[]> {
    return this.getUsers(name, userLoggedIn).pipe(
      map((users: IUser[]) => {
        const usersWithDistance = this.geolocationService.getUsersByGeoLocation(
          userLoggedIn,
          users
        );
        return usersWithDistance;
      })
    );
  }

  getUsers(name: string = '', userLoggedIn: IUser): Observable<IUser[]> {
    const search = name.toLocaleLowerCase().split('');
    return this.ang
      .collection<IUser>('users', (ref) =>
        ref
          .where('displayName', '!=', userLoggedIn.displayName)
          .orderBy('displayName')
          .startAt(name)
          .endAt(name + '\uf8ff')
      )
      .valueChanges();
  }

  getUser(userId: string): Observable<IUser> {
    return this.ang.doc<IUser>(`users/${userId}`).valueChanges();
  }

  getFriendsForLoggedUser(userLoggedIn: IUser): Observable<string[]> {
    return this.ang
      .collection<IUser>(`users`)
      .valueChanges()
      .pipe(
        switchMap(() => {
          return this.ang
            .doc(`users/${userLoggedIn.id}`)
            .collection('friends')
            .valueChanges()
            .pipe(
              map((data) => {
                return data.map((x) => x.ToUserId);
              })
            );
        })
      );
  }

  //for current user
  async addFriendCurrentLoggedUser(
    initUserId: string,
    ToUserId: string,
    first = true
  ) {
    const friendsRaw = this.ang
      .doc(`users/${initUserId}`)
      .collection('friends');

    friendsRaw
      .snapshotChanges()
      .pipe(take(1))
      .subscribe(async (data) => {
        const notToDoAnything =
          data.length > 0 && data.every((x) => x.type !== 'added');
        if (notToDoAnything) return;

        const alreadyExists: any = !!data.find(
          (x) => x.payload.doc.data().ToUserId === ToUserId
        );
        if (alreadyExists)
          return this.toastrService.showWarning(
            'This user is already your friend'
          );

        const userToCreateRef = friendsRaw.doc().ref;

        await userToCreateRef.set({ ToUserId });

        if (first) {
          await this.addFriendCurrentLoggedUser(ToUserId, initUserId, false);
        }
      });
  }

  async removeFriendForLoggedUser(
    initUserId: string,
    ToUserId: string,
    first = true
  ) {
    const friendsRaw = this.ang
      .doc(`users/${initUserId}`)
      .collection('friends');
    friendsRaw
      .snapshotChanges()
      .pipe(take(1))
      .subscribe(async (users) => {
        const notToDoAnything =
          users.length > 0 && users.every((x) => x.type !== 'added');
        if (notToDoAnything) return;

        const userRef: any = users.find(
          (x) => x.payload.doc.data().ToUserId === ToUserId
        );
        if (!userRef)
          return this.toastrService.showWarning(
            'This user is not in your friend list'
          );

        const userIdref = userRef.payload.doc.id;

        await friendsRaw.doc(userIdref).delete();
        //remove friend for other user
        if (first) {
          await this.removeFriendForLoggedUser(ToUserId, initUserId, false);
        }
      });
  }
}
