import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { IUser } from 'src/app/_models/IUser';
import { IdleDetectorService } from 'src/app/_services/idle-detector.service';
import { LastReadService } from 'src/app/_services/last-read.service';
import { MessagesService } from 'src/app/_services/messages.service';
import { ToastrService } from 'src/app/_services/toastr.service';
import { UsersService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit, OnDestroy, AfterViewInit {
  subscriptions: Subscription[] = [];
  @Input() user: IUser;
  unreadMessages: number;
  @Input() currentUser: IUser;

  constructor(
    private userService: UsersService,
    private idleDetector: IdleDetectorService,
    private messageService: MessagesService,
    private toastrService: ToastrService,
    private lastReadService: LastReadService
  ) {}

  ngAfterViewInit(): void {
    if (!this.user) return;
    this.messageService.userTalkingTo$.subscribe((user) => {
      //if a user select unread messages are 0

      if (!user || (user && user.id !== this.user.id)) {
        this.subscriptions.push(
          this.messageService
            .getMessagesFrom(this.user.id, this.currentUser)
            .subscribe((messages) => {
              if (messages.length > 0) {
                this.subscriptions.push(
                  this.lastReadService
                    .getLastRead(this.user.id, this.currentUser)
                    .subscribe((lastRead) => {
                      if (lastRead) {
                        this.unreadMessages = messages.filter(
                          (x) => x.time > lastRead
                        ).length;
                      } else {
                        this.unreadMessages = 0;
                      }
                    })
                );
              }
            })
        );
      } else {
        this.ngOnDestroy();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }

  ngOnInit(): void {}

  deleteFromFriends() {
    this.userService.removeFriendForLoggedUser(
      this.currentUser.id,
      this.user.id
    );
    this.toastrService.showSuccess('User deleted!');
  }

  async setUserTalkingTo() {
    await this.idleDetector.setOnline(this.currentUser);
    this.lastReadService.setLastRead(this.user.id, true, this.currentUser);
    this.messageService.selectUserTalkingTo(this.user);
  }
}
