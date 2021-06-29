import { take } from 'rxjs/operators';
import { Component, HostListener, OnInit } from '@angular/core';
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
export class ChatComponent implements OnInit {
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

  ngOnInit(): void {
    this.authService.currentUser.pipe(take(1)).subscribe((user) => {
      this.loggedUser = user;
      this.geoLocationService.setCoordsToLoggedUser(this.loggedUser.id);
      this.messageService.userTalkingTo$.subscribe((userTalkingTo) => {
        this.userTalkingTo = userTalkingTo;
      });
    });
  }

  @HostListener('window:resize', ['$event'])
  resize(event) {
    this.screenHeight = event.target.innerHeight - 50;
  }
}
