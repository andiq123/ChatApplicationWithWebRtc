import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { LoadingService } from './_services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    public loadingService: LoadingService,
    private updateSw: SwUpdate
  ) {}

  ngOnInit(): void {
    this.updateSw.available.subscribe((data) => {
      document.location.reload();
      console.log('there is update');
    });
  }
}
