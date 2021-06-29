import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RingtoneService {
  private ringToneUrl = './assets/ringTone.mp3';
  private audioPlayer = new Audio(this.ringToneUrl);
  private isPlaying: boolean = false;
  private volume = 0.3;

  constructor() {
    this.audioPlayer.volume = this.volume;

    this.audioPlayer.onplaying = () => {
      this.isPlaying = true;
    };
    this.audioPlayer.onpause = () => {
      this.isPlaying = false;
    };
    this.audioPlayer.onended = () => {
      this.play();
    };
  }

  play() {
    if (this.isPlaying) return;

    this.audioPlayer.currentTime = 0;
    this.audioPlayer.play();
  }

  stop() {
    if (this.isPlaying) this.audioPlayer.pause();
  }
}
