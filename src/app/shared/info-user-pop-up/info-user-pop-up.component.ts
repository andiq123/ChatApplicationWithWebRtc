import { Component, Input, OnInit } from '@angular/core';
import { IUser } from 'src/app/_models/IUser';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-info-user-pop-up',
  templateUrl: './info-user-pop-up.component.html',
  styleUrls: ['./info-user-pop-up.component.scss'],
})
export class InfoUserPopUpComponent implements OnInit {
  @Input() user: IUser;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {}
}
