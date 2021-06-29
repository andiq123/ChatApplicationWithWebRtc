import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-status-activity',
  templateUrl: './status-activity.component.html',
  styleUrls: ['./status-activity.component.scss'],
})
export class StatusActivityComponent implements OnInit, OnDestroy {
  @Input() lastActive: number;
  isActive: boolean;
  lastActiveDate: Date;
  timeOut;

  constructor() {}

  ngOnDestroy(): void {
    clearTimeout(this.timeOut);
  }

  ngOnInit(): void {
    if (this.lastActive) {
      this.lastActiveDate = new Date(this.lastActive);
      this.isActive =
        new Date().getTime() - this.lastActiveDate.getTime() < 60000;

      if (this.timeOut) {
        clearInterval(this.timeOut);
      }

      if (this.isActive) {
        this.timeOut = setTimeout(() => {
          this.isActive =
            new Date().getTime() - this.lastActiveDate.getTime() < 60000;
        }, 61 * 1000);
      }
    }
  }
}
