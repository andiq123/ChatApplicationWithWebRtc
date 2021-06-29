import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Call } from 'src/app/_enums/call.enum';
import { CallPartialService } from 'src/app/_services/call-partial.service';
import { CallStateService } from 'src/app/_services/call-state.service';
import { CallService } from 'src/app/_services/call.service';
import { ToastrService } from 'src/app/_services/toastr.service';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss'],
})
export class CallComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  localStream: MediaStream = null;
  remoteStream: MediaStream = null;
  callState = null;
  enum = Call;
  callerId: string;

  constructor(
    public callPartialService: CallPartialService,
    private callService: CallService,
    private callStateService: CallStateService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.callService.eventlocalStream.subscribe((stream) => {
        if (stream) {
          stream.getAudioTracks().forEach((x) => (x.enabled = false));
          this.localStream = stream;
        }
      })
    );

    this.subscriptions.push(
      this.callService.eventremoteStream.subscribe((stream) => {
        if (stream) {
          this.remoteStream = stream;

          this.callStateService.setCallConnectionSuccesfull();
        }
      })
    );

    this.subscriptions.push(
      this.callStateService.$CallState.subscribe((state) => {
        if (state === this.enum.CallRefused) {
          setTimeout(() => {
            this.callStateService.setIdle();
          }, 2000);
        }
        this.callState = state;
      })
    );
  }

  isAudioEnabled = true;
  muteMic() {
    this.callService.muteMic(this.isAudioEnabled);
    this.isAudioEnabled = !this.isAudioEnabled;
  }

  isVideoEnabled = false;
  muteVideo() {
    this.callService.muteVideo(this.isVideoEnabled);
    this.isVideoEnabled = !this.isVideoEnabled;
  }

  async hangUp() {
    await this.callService.hangUp();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }
}
