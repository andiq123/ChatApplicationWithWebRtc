import {
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { IUser } from 'src/app/_models/IUser';
import { IUserWithDistance } from 'src/app/_models/IUserWithDistance';
import { AddFriendService } from 'src/app/_services/add-friend.service';
import { AuthService } from 'src/app/_services/auth.service';
import { ToastrService } from 'src/app/_services/toastr.service';
import { UsersService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.component.html',
  styleUrls: ['./add-friend.component.scss'],
})
export class AddFriendComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  users: IUserWithDistance[] = [];
  usersFiltered = this.users;
  searchCriteria: string = '';
  range: number = 30;
  readonly maxRange = 50;
  @Input() loggedUser: IUser;

  constructor(
    private usersService: UsersService,
    public addFriendService: AddFriendService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.subGetUsers();
  }

  subGetUsers() {
    this.subscriptions.push(
      this.usersService
        .getUsersWithDistance(this.searchCriteria, this.loggedUser)
        .subscribe((users: IUserWithDistance[]) => {
          this.users = users;
          this.usersFiltered = this.users
            .filter((x) => +x.distance <= this.range)
            .sort((a, b) => +a.distance - +b.distance);
        })
    );
  }

  changeRange(event) {
    this.range = event.target.value > 50 ? 50 : event.target.value;
    this.usersFiltered = this.users.filter((x) => +x.distance <= this.range);
  }

  search($event: Event = null) {
    this.subGetUsers();
  }

  async addToFriends(user: IUser) {
    await this.usersService.addFriendCurrentLoggedUser(
      this.loggedUser.id,
      user.id
    );
    this.toastrService.showSuccess('User Added!');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }
}
