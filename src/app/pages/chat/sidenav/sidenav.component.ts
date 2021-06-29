import {
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { async } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { IUser } from 'src/app/_models/IUser';
import { AddFriendService } from 'src/app/_services/add-friend.service';
import { AuthService } from 'src/app/_services/auth.service';
import { EditProfileService } from 'src/app/_services/edit-profile.service';
import { IdleDetectorService } from 'src/app/_services/idle-detector.service';
import { MessagesService } from 'src/app/_services/messages.service';
import { SidenavService } from 'src/app/_services/sidenav.service';
import { UsersService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit, OnDestroy {
  private subscription: Subscription[] = [];
  @Input() currentUser: IUser;
  contacts: IUser[] = [];
  loading: boolean = false;

  public showSidenav: boolean = window.innerWidth >= 800;
  public contactsHeight = this.showSidenav ? window.innerHeight - 125 : 100;

  constructor(
    public authService: AuthService,
    public showAddFriend: AddFriendService,
    public showSidenavService: SidenavService,
    private showEditProfie: EditProfileService,
    private userService: UsersService,
    private idleDetectorService: IdleDetectorService,
    private messageService: MessagesService
  ) {}

  ngOnInit(): void {
    (async () => {
      this.setOnline();
    })();

    this.loadFriends();
  }

  async setOnline() {
    await this.idleDetectorService.setOnline(this.currentUser);
  }

  firstRound = true;
  loadFriends() {
    if (this.firstRound) this.loading = true;

    this.subscription.push(
      this.userService
        .getFriendsForLoggedUser(this.currentUser)
        .subscribe((users) => {
          if (this.firstRound) {
            this.firstRound = false;
          }
          if (users.length === 0) {
            this.contacts = [];
            this.messageService.selectUserTalkingTo(null);
          } else {
            if (this.contacts.length > users.length) {
              this.contacts = [];
            }
            users.forEach((element) => {
              this.userService
                .getUser(element)
                .pipe(take(1))
                .subscribe((user) => {
                  const exists = this.contacts.find((x) => x.id === user.id);
                  //if exists, just update the status
                  if (exists) {
                    this.contacts[this.contacts.indexOf(exists)] = user;
                  } else {
                    this.contacts.push(user);
                  }
                });
            });
          }
          this.loading = false;
        })
    );
  }

  openEditProfile() {
    this.showEditProfie.open();
  }

  @HostListener('window:resize', ['$event'])
  checkIfScreenSmallToHideSideNav(event) {
    this.showSidenav = event.target.innerWidth >= 800;
    const calc = event.target.innerHeight - 125;
    this.contactsHeight = this.showSidenav ? calc : 100;
  }

  ngOnDestroy(): void {
    this.subscription.forEach((x) => x.unsubscribe());
  }
}
