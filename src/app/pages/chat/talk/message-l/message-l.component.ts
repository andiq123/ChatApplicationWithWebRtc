import { Component, Input, OnInit } from '@angular/core';
import { IMessage } from 'src/app/_models/IMessage';
import { IUser } from 'src/app/_models/IUser';

@Component({
  selector: 'app-message-l',
  templateUrl: './message-l.component.html',
  styleUrls: ['./message-l.component.scss'],
})
export class MessageLComponent implements OnInit {
  @Input() User: IUser;
  @Input() message: IMessage;

  constructor() {}

  ngOnInit(): void {}
}
