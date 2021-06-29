import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { ILoginModel } from '../_models/Auth/login';
import { IRegisterModel } from '../_models/Auth/register';
import { IUser } from '../_models/IUser';
import { from, Observable, of } from 'rxjs';
import { ToastrService } from './toastr.service';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser: Observable<IUser | null>;
  currentUserCache: IUser = null;

  constructor(
    private auth: AngularFireAuth,
    private store: AngularFirestore,
    private toastrService: ToastrService,
    private router: Router
  ) {
    this.currentUser = this.auth.authState.pipe(
      tap((user) => {
        if (this.currentUserCache) {
          return of(this.currentUserCache);
        }
        return user;
      }),
      switchMap((user) => {
        if (user) {
          return this.store
            .doc<IUser>(`users/${user.uid}`)
            .valueChanges()
            .pipe(
              tap((user) => {
                if (user) {
                  this.currentUserCache = user;
                }
              })
            );
        } else {
          return of(null);
        }
      })
    );
  }

  checkIfUserNameAvailable(userName: string) {
    return this.store
      .collection<string>('users', (ref) =>
        ref
          .orderBy('displayName')
          .startAt(userName)
          .endAt(userName + '\uf8ff')
      )
      .valueChanges()
      .pipe(
        take(1),
        map((data) => data.length === 0)
      );
  }

  getCurrentUserManual() {
    return this.currentUserCache;
  }

  async signInGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const cred = await this.auth.signInWithPopup(provider);

      const userRef: AngularFirestoreDocument<IUser> = this.store.doc(
        `users/${cred.user.uid}`
      );
      const userToCreate: IUser = {
        displayName: cred.user.displayName.toLocaleLowerCase(),
        photoUrl: cred.user.photoURL,
        id: cred.user.uid,
        lastActive: Date.now(),
      };
      await userRef.set(userToCreate);
      return true;
    } catch (error) {
      this.toastrService.showError(error);
      return false;
    }
  }

  async register(model: IRegisterModel) {
    try {
      const cred = await this.auth.createUserWithEmailAndPassword(
        model.email,
        model.password
      );

      const userRef: AngularFirestoreDocument<IUser> = this.store.doc(
        `users/${cred.user.uid}`
      );

      const userToCreate: IUser = {
        displayName: model.displayName.toLocaleLowerCase(),
        photoUrl: './assets/defaultProfile.jpg',
        id: cred.user.uid,
        lastActive: Date.now(),
        description: model.description,
      };
      await userRef.set(userToCreate);
      return true;
    } catch (error) {
      this.toastrService.showError(error);
      return false;
    }
  }

  async login(model: ILoginModel) {
    try {
      const user = await this.auth.signInWithEmailAndPassword(
        model.email,
        model.password
      );

      if (user) {
        return true;
      }
      return false;
    } catch (error) {
      this.toastrService.showError(error);
      return false;
    }
  }

  async signOut() {
    await this.auth.signOut();
    this.currentUserCache = null;
    this.router.navigate(['/login']);
  }
}
