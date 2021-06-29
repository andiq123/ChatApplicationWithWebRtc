import {
  AfterViewInit,
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { IMessage } from 'src/app/_models/IMessage';
import { IUser } from 'src/app/_models/IUser';
import { AuthService } from 'src/app/_services/auth.service';
import { CallPartialService } from 'src/app/_services/call-partial.service';
import { CallStateService } from 'src/app/_services/call-state.service';
import { CallService } from 'src/app/_services/call.service';
import { IdleDetectorService } from 'src/app/_services/idle-detector.service';
import { LastReadService } from 'src/app/_services/last-read.service';
import { MessagesService } from 'src/app/_services/messages.service';
import { OnTypingService } from 'src/app/_services/on-typing.service';
import { SidenavService } from 'src/app/_services/sidenav.service';

@Component({
  selector: 'app-talk',
  templateUrl: './talk.component.html',
  styleUrls: ['./talk.component.scss'],
})
export class TalkComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewInit
{
  private subscriptions: Subscription[] = [];
  @Input() loggedUser: IUser;
  @Input() userTalkingTo: IUser;
  chatMessagesHeight = window.innerHeight - 100;
  isTyping: boolean = false;
  showUserPopUp = false;
  messageSeen: boolean = false;

  @HostListener('window:resize', ['$event'])
  resizeMessagesHeight(event) {
    this.chatMessagesHeight = event.target.innerHeight - 100;
  }

  messages: IMessage[] = [];
  @ViewChild('scrollContent') scrollContent: any;

  constructor(
    public showSidenavService: SidenavService,
    private messageService: MessagesService,
    private callService: CallService,
    private callStateService: CallStateService,
    private callPartialService: CallPartialService,
    private onTypingService: OnTypingService,
    private lastReadService: LastReadService
  ) {}

  setlastRead() {
    if (this.messages.length > 0)
      this.subscriptions.push(
        this.lastReadService
          .getLastRead1(this.userTalkingTo.id, this.loggedUser)
          .subscribe((lastRead) => {
            this.messageSeen =
              lastRead >= this.messages[this.messages.length - 1].time;
          })
      );
  }

  firstLoading = true;
  ngAfterViewInit(): void {
    // this.scrollContent.nativeElement.addEventListener('scroll', (e) => {
    //   if (!this.firstLoading && e.target.scrollTop === 0) {
    //     this.limitOfMessages += 2;
    //     this.getMessages(true);
    //   }
    //   this.firstLoading = false;
    // });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.userTalkingTo) {
      this.messages = [];
      this.firstLoading = true;
      this.limitOfMessages = 5;
      this.ngOnDestroy();
      this.ngOnInit();
    }
  }

  ngOnInit(): void {
    if (this.userTalkingTo) {
      this.getMessages();
      this.listenForTypingChanges();
    }
  }

  listenForTypingChanges() {
    this.subscriptions.push(
      this.onTypingService
        .listenForTypingChanges(this.userTalkingTo.id, this.loggedUser.id)
        .subscribe((data) => {
          this.isTyping = data;
        })
    );
  }

  alreadyPressed: boolean = false;
  async makeCall() {
    if (!this.alreadyPressed) {
      this.alreadyPressed = true;
      await this.callService.initialize();
      this.callStateService.setCallToWatingState();

      this.callService
        .createOffer(this.loggedUser.id, this.userTalkingTo.id)
        .subscribe(
          async (data) => {
            if (data.state === 'waitingForAnswer') {
              this.alreadyPressed = false;
              this.callService.sendLocalStream();
              this.subscriptions.push(
                this.callPartialService
                  .listenWhenSomeoneHungsUp(data.id)
                  .subscribe((id) => {
                    this.callService.endStream();
                    this.callPartialService.hangUp(id);
                  })
              );
            } else if (data.state === 'answered') {
              this.callStateService.setCallToAcceptedCallButWaitingConnection();
              this.alreadyPressed = false;
            } else {
              console.log('wtf');
            }
          },
          (data) => {
            setTimeout(() => {
              this.callPartialService.hangUp(data.id);
            }, 1000);
            this.alreadyPressed = false;
          },
          () => {}
        );
    }
  }

  limitOfMessages = 5;
  getMessages(isLoadingOlderMessages = false) {
    this.subscriptions.push(
      this.messageService
        .getMessages(
          this.userTalkingTo.id,
          this.limitOfMessages,
          this.loggedUser
        )
        .subscribe((messages: IMessage[]) => {
          this.messages = messages;
          if (!isLoadingOlderMessages) this.scrollToBottom();
          this.setlastRead();
        })
    );
  }

  //add a message, send a message
  onSubmit(form: NgForm) {
    // this.idleDetectorService.setOnline();
    this.lastReadService.setLastRead(
      this.userTalkingTo.id,
      true,
      this.loggedUser
    );

    if (this.userTalkingTo) {
      const textValue = form.value.text;
      if (!textValue) return;
      const msg: IMessage = {
        userIdTo: this.userTalkingTo.id,
        text: textValue,
        time: Date.now(),
      };

      this.subscriptions.push(
        this.messageService
          .addMessage(msg, this.loggedUser)
          .subscribe(async () => {
            form.resetForm();
            await this.setInputTypeChange(false);
          })
      );
    }
  }

  async setInputTypeChange($event) {
    if ($event) {
      const status = $event.target.value.length > 0;
      if (!this.loggedUser.id && !this.userTalkingTo.id) return;
      await this.onTypingService.setIsTyping(
        this.loggedUser.id,
        this.userTalkingTo.id,
        status
      );
    } else {
      await this.onTypingService.setIsTyping(
        this.loggedUser.id,
        this.userTalkingTo.id,
        false
      );
    }
  }

  scrollToBottom() {
    if (this.scrollContent) {
      if (
        this.scrollContent.nativeElement.scrollHeight >
        this.scrollContent.nativeElement.scrollTop
      )
        this.scrollContent.nativeElement.scrollTop =
          this.scrollContent.nativeElement.scrollHeight +
          this.scrollContent.nativeElement.clientHeight;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }
}
