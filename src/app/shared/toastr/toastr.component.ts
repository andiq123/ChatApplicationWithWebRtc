import { Component, OnInit } from '@angular/core';
import { ToastrService } from '../../_services/toastr.service';

@Component({
  selector: 'app-toastr',
  templateUrl: './toastr.component.html',
  styleUrls: ['./toastr.component.scss'],
})
export class ToastrComponent implements OnInit {
  showInfo: boolean = false;
  maxTimeOut: number = 4;
  message: string = '';
  typeInfo: 'success' | 'error' | 'warning' = 'success';
  timeOut = null;

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.toastr.onShowSuccess.subscribe((message: string) => {
      this.typeInfo = 'success';
      this.message = message;
      this.toggleInfo();
    });

    this.toastr.onShowError.subscribe((message: string) => {
      this.typeInfo = 'error';
      this.message = message;
      this.toggleInfo();
    });

    this.toastr.onShowWarning.subscribe((message: string) => {
      this.typeInfo = 'warning';
      this.message = message;
      this.toggleInfo();
    });
  }

  toggleInfo() {
    if (this.timeOut) {
      clearTimeout(this.timeOut);
    }
    this.showInfo = true;
    this.timeOut = setTimeout(() => {
      this.showInfo = false;
    }, this.maxTimeOut * 1000);
  }
}
