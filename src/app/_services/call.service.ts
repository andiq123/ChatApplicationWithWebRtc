import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subject, Subscription } from 'rxjs';

import { CallPartialService } from './call-partial.service';
import { CallStateService } from './call-state.service';
import { ToastrService } from './toastr.service';

@Injectable({
  providedIn: 'root',
})
export class CallService implements OnDestroy {
  subscriptions: Subscription[] = [];

  localStream: MediaStream = null;
  remoteStream: MediaStream = new MediaStream();
  eventlocalStream: Subject<MediaStream> = new Subject<MediaStream>();
  eventremoteStream: Subject<MediaStream> = new Subject<MediaStream>();

  offer: string;
  servers = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
    ],
    iceCandidatePoolSize: 10,
  };

  private pc: RTCPeerConnection = null;

  constructor(
    private store: AngularFirestore,
    private toastrService: ToastrService,
    private callStateService: CallStateService,
    private callPartialService: CallPartialService
  ) {}

  endStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((x) => x.stop());
    }
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((x) => x.stop());
    }
    this.localStream = null;
    this.remoteStream = null;

    if (this.pc) this.pc.close();

    this.ngOnDestroy();
  }

  async initialize() {
    this.pc = new RTCPeerConnection(this.servers);
    this.startRemoteStream();
    await this.startLocalStream();
  }

  async startLocalStream(): Promise<void> {
    try {
      if (!this.localStream) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: { echoCancellation: true, },
        });
      }

      if (!this.localStream) {
        return this.toastrService.showError('Please enable camera');
      }

      // Push tracks from local stream to peer connection
      this.localStream.getTracks().forEach((track) => {
        this.pc.addTrack(track, this.localStream);
      });
    } catch (error) {
      console.log(error);
      this.toastrService.showError('problems starting local server');
    }
  }

  muteMic(status: boolean) {
    if (this.pc && this.localStream) {
      this.pc.getSenders().forEach((x) => {
        if (x.track.kind === 'audio') x.track.enabled = status;
      });
    }
  }

  muteVideo(status: boolean) {
    if (this.pc && this.localStream) {
      this.localStream.getVideoTracks()[0].enabled = status;
    }
  }

  startRemoteStream() {
    try {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      this.pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          this.remoteStream.addTrack(track);
        });

        this.sendRemoteStream();
      };
    } catch (error) {
      this.toastrService.showError('problems starting remote server');
    }
  }

  sendLocalStream() {
    this.eventlocalStream.next(this.localStream);
  }

  sendRemoteStream() {
    this.eventremoteStream.next(this.remoteStream);
  }

  createOffer(
    userWhoCallsId: string,
    userToCallId: string
  ): Observable<{ state: string; id: string }> {
    return new Observable<{ state: string; id: string }>((observer) => {
      (async () => {
        try {
          const docRef = this.store.collection('calls').ref;
          const searchWhoCalls = docRef
            .where('userWhoCallsId', '==', userToCallId)
            .get();
          const searchWhoIsCalled = docRef
            .where('userToCallId', '==', userToCallId)
            .get();
          const promises = await Promise.all([
            searchWhoCalls,
            searchWhoIsCalled,
          ]);

          const alreadyInCall = promises.find((x) => {
            return x.docs.length > 0;
          });

          if (alreadyInCall) {
            this.toastrService.showError('User already in a call');
            observer.error({ state: 'error', id: null });
            this.callStateService.setCallRefused();
            observer.complete();
          } else {
            // if user is not already in a call do the calling;

            const callDoc = this.store.collection('calls').doc();
            const offerCandidates = callDoc.collection('offerCandidates');
            const answerCandidates = callDoc.collection('answerCandidates');

            //adding event to add offer candidates
            this.pc.addEventListener('icecandidate', async (event) => {
              if (event.candidate) {
                const json = event.candidate.toJSON();
                await offerCandidates.add(json);
              }
            });

            // Create offer
            const offerDescription = await this.pc.createOffer({
              iceRestart: true,
            });

            await this.pc.setLocalDescription(offerDescription);

            const offer = {
              sdp: offerDescription.sdp,
              type: offerDescription.type,
            };

            await callDoc.set({
              offer,
              userWhoCallsId,
              userToCallId,
              id: callDoc.ref.id,
            });

            this.offer = callDoc.ref.id;

            observer.next({
              state: 'waitingForAnswer',
              id: callDoc.ref.id,
            });

            //listen when someone response;
            this.subscriptions.push(
              callDoc.snapshotChanges().subscribe(async (actions) => {
                const data: any = await actions.payload.data();
                if (data && !this.pc.currentRemoteDescription && data.answer) {
                  observer.next({
                    state: 'answered',
                    id: callDoc.ref.id,
                  });
                  const answer = new RTCSessionDescription(data.answer);
                  await this.pc.setRemoteDescription(answer);
                }
              })
            );

            this.subscriptions.push(
              answerCandidates.snapshotChanges().subscribe(async (actions) => {
                actions.forEach(async (action) => {
                  if (action.type === 'added') {
                    const data = await action.payload.doc.data();
                    if (data) {
                      const candidate = new RTCIceCandidate(data);
                      try {
                        await this.pc.addIceCandidate(candidate);
                      } catch (error) {
                        this.pc
                          .addIceCandidate(candidate)
                          .then(() => {})
                          .catch((e) => {
                            // this.toastrService.showWarning(
                            //   'There might be a problem with sound'
                            // );
                            // observer.error({
                            //   state: 'error',
                            //   id: callDoc.ref.id,
                            // });
                          });
                      }
                    }
                  }
                });
              })
            );
          }
        } catch (error) {
          this.toastrService.showError(
            'au aparut ceva probleme legate de apel, un refresh ar putea rezolva problema'
          );
        }
      })();
    });
  }

  answer(id: string): Observable<string> {
    this.callStateService.setCallToAcceptedCallButWaitingConnection();
    return new Observable<string>((observer) => {
      (async () => {
        try {
          if (!id) {
            this.toastrService.showError('there was offer id when answering ');
            return observer.complete();
          }

          const callDoc = this.store.collection(`calls`).doc(id);
          const offerCandidates = callDoc.collection('offerCandidates');
          const answerCandidates = callDoc.collection('answerCandidates');

          //adding event to add offer candidates
          this.pc.addEventListener('icecandidate', async (event) => {
            if (event.candidate) {
              const json = event.candidate.toJSON();
              await answerCandidates.add(json);
            }
          });

          this.subscriptions.push(
            callDoc.snapshotChanges().subscribe(async (action) => {
              if (action.type !== 'added') return;
              const data: any = await action.payload.data();

              if (!data)
                return this.toastrService.showError(
                  'there was a problem answering'
                );

              const offerDescription = data.offer;

              await this.pc.setRemoteDescription(
                new RTCSessionDescription(offerDescription)
              );

              const answerDescription = await this.pc.createAnswer();

              await this.pc.setLocalDescription(answerDescription);

              const answer = {
                type: answerDescription.type,
                sdp: answerDescription.sdp,
              };

              await callDoc.update({ answer });
              this.offer = data.id;
              //calback listen to someone when hungsup;
              observer.next(data.id);

              this.subscriptions.push(
                offerCandidates.snapshotChanges().subscribe(async (actions) => {
                  actions.forEach(async (action) => {
                    if (action.type === 'added') {
                      const data = await action.payload.doc.data();
                      if (data) {
                        const candidate = new RTCIceCandidate(data);
                        try {
                          await this.pc.addIceCandidate(candidate);
                        } catch (error) {
                          this.pc
                            .addIceCandidate(candidate)
                            .then(() => {})
                            .catch(() => {});
                        }
                      }
                    }
                  });
                })
              );
            })
          );
        } catch (error) {
          this.toastrService.showError(
            'au aparut ceva probleme legate de apel, un refresh ar putea rezolva problema'
          );
        }
      })();
    });
  }

  async hangUp() {
    if (!this.offer) console.log('no offer id in call service');
    await this.callPartialService.hangUp(this.offer);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }
}
