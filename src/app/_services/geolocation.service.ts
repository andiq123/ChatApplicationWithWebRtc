import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take, tap } from 'rxjs/operators';
import { IUser } from '../_models/IUser';
import { IUserWithDistance } from '../_models/IUserWithDistance';
import { AuthService } from './auth.service';
import { ToastrService } from './toastr.service';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  constructor(
    private fireStore: AngularFirestore,
    private toastrService: ToastrService
  ) {}

  async getGeoLocationFromClient(): Promise<{
    latitude: number;
    longitude: number;
  }> {
    return new Promise<{
      latitude: number;
      longitude: number;
    }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation Not Enabled');
      } else {
        navigator.geolocation.getCurrentPosition(
          (data) => {
            resolve(data.coords);
          },
          () => {
            reject('Error getting coords');
          }
        );
      }
    });
  }

  setCoordsToLoggedUser(loggedUserId: string) {
    this.getGeoLocationFromClient().then((coords) => {
      this.fireStore
        .doc(`users/${loggedUserId}`)
        .update({
          coords: { latitude: coords.latitude, longitude: coords.longitude },
        })
        .then(
          () => {},
          (e) => {
            this.toastrService.showWarning(e);
          }
        );
    });
  }
  users: IUser[] = [];

  getUsersByGeoLocation(currentUser: IUser, users: IUser[]) {
    const usersWithCoords: IUser[] = users.filter((x) => x.coords);
    const usersToSendBack: IUserWithDistance[] = usersWithCoords.map((x) => {
      const distance = this.calcCrow(
        currentUser.coords.latitude,
        currentUser.coords.longitude,
        x.coords.latitude,
        x.coords.longitude
      );
      return { user: x, distance };
    });

    return usersToSendBack;
  }

  calcCrow(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    lat1 = this.toRad(lat1);
    lat2 = this.toRad(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toLocaleString();
  }

  // Converts numeric degrees to radians
  toRad(Value) {
    return (Value * Math.PI) / 180;
  }
}
