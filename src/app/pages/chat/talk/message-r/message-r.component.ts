import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { IMessage } from 'src/app/_models/IMessage';
import { IUser } from 'src/app/_models/IUser';
import { LastReadService } from 'src/app/_services/last-read.service';

@Component({
  selector: 'app-message-r',
  templateUrl: './message-r.component.html',
  styleUrls: ['./message-r.component.scss'],
})
export class MessageRComponent implements OnInit, OnDestroy {
  @Input() User: IUser;
  @Input() message: IMessage;

  lastSeen: boolean = false;
  constructor() {}

  ngOnDestroy(): void {

  }

  ngOnInit(): void {}
}
