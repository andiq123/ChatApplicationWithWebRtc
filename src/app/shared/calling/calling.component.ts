import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Call } from 'src/app/_enums/call.enum';
import { CallPartialService } from 'src/app/_services/call-partial.service';
import { CallStateService } from 'src/app/_services/call-state.service';
import { CallService } from 'src/app/_services/call.service';
import { RingtoneService } from 'src/app/_services/ringtone.service';

@Component({
  selector: 'app-calling',
  templateUrl: './calling.component.html',
  styleUrls: ['./calling.component.scss'],
})
export class CallingComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  show: boolean = false;
  conversationId: string;

  constructor(
    private callService: CallService,
    private callPartialService: CallPartialService,
    private callStateService: CallStateService,
    private ringToneService: RingtoneService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.callStateService.$CallState.subscribe((state) => {
        if (state && state === Call.SomeOneCallsYou) {
          this.show = true;
        } else {
          this.show = false;
        }
      })
    );
    this.subscriptions.push(
      this.callStateService.$IdWhenSomeOneCalls.subscribe((id) => {
        this.conversationId = id;
        this.subscriptions.push(
          this.callPartialService
            .listenWhenSomeoneHungsUp(id)
            .subscribe((id) => {
              this.callService.endStream();
              this.callPartialService.hangUp(id);
            })
        );
      })
    );
  }

  async answer() {
    if (!this.conversationId)
      return console.log(
        'celik verifica in calling component, acolo lipseste caller id'
      );

    await this.callService.initialize();
    this.callService.sendLocalStream();

    this.callService.answer(this.conversationId).subscribe((id) => {
      this.ringToneService.stop();
      this.conversationId = id;
      this.callStateService.setCallToAcceptedCallButWaitingConnection();
      this.callService.sendRemoteStream();
    });
  }

  async hangUp(id: string = null) {
    const idToUse = id ? id : this.conversationId;
    this.callService.endStream();
    await this.callPartialService.hangUp(idToUse);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }
}
