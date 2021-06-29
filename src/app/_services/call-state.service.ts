import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Call } from '../_enums/call.enum';

@Injectable({
  providedIn: 'root',
})
export class CallStateService {
  $CallState = new BehaviorSubject<Call>(Call.Idle);
  $IdWhenSomeOneCalls = new Subject<string>();

  constructor() {}

  setIdle() {
    this.$CallState.next(Call.Idle);
  }

  setCallToWatingState() {
    this.$CallState.next(Call.WaitingForAnswer);
  }

  setCallToAcceptedCallButWaitingConnection() {
    this.$CallState.next(Call.CallAcceptedWaitingForConnection);
  }

  setCallConnectionSuccesfull() {
    this.$CallState.next(Call.ConnectionSuccessfull);
  }

  setCallRefused() {
    this.$CallState.next(Call.CallRefused);
  }

  setSomeOneCallsYou(id: string) {
    this.$IdWhenSomeOneCalls.next(id);
    this.$CallState.next(Call.SomeOneCallsYou);
  }
}
