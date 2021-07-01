import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IUser } from 'src/app/_models/IUser';
import { AddFriendService } from 'src/app/_services/add-friend.service';
import { AuthService } from 'src/app/_services/auth.service';
import { EditProfileService } from 'src/app/_services/edit-profile.service';
import { GeolocationService } from 'src/app/_services/geolocation.service';
import { MessagesService } from 'src/app/_services/messages.service';
import { SidenavService } from 'src/app/_services/sidenav.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  loggedUser: IUser;
  userTalkingTo: IUser;
  screenHeight = window.innerHeight - 5;

  constructor(
    public showAddFriend: AddFriendService,
    public editProfile: EditProfileService,
    public sidenavService: SidenavService,
    private authService: AuthService,
    private messageService: MessagesService,
    private geoLocationService: GeolocationService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.authService.currentUser.subscribe((user) => {
        this.loggedUser = user;
      })
    );

    this.subscriptions.push(
      this.messageService.userTalkingTo$.subscribe((userTalkingTo) => {
        this.userTalkingTo = userTalkingTo;
      })
    );

    let interval;
    if (!this.loggedUser) {
      interval = setInterval(() => {
        if (this.loggedUser) {
          this.geoLocationService.setCoordsToLoggedUser(this.loggedUser.id);
          clearInterval(interval);
        }
      }, 3000);
    }
  }

  @HostListener('window:resize', ['$event'])
  resize(event) {
    this.screenHeight = event.target.innerHeight - 50;
  }
}
