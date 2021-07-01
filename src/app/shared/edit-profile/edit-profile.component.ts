import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { IUser } from 'src/app/_models/IUser';
import { AuthService } from 'src/app/_services/auth.service';
import { EditProfileService } from 'src/app/_services/edit-profile.service';
import { ToastrService } from 'src/app/_services/toastr.service';
import { DescriptionLimiter } from 'src/app/_utilities/descriptionLimiter.utility';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  readonly sizeLimit = 3;
  @Input() loggedUser: IUser;
  progress = 0;

  constructor(
    public editProfile: EditProfileService,
    private store: AngularFirestore,
    private storage: AngularFireStorage,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  async fileInput(event: any) {
    const files = event.target.files;
    if (!files) return;

    const checkIfValid = this.checkIfValid(files[0]);
    if (!checkIfValid) return;

    const randomId = Math.random().toString(36).substring(2);
    const ref = this.storage.ref(randomId);
    const task = ref.put(files[0]);
    const percentages = task.percentageChanges();
    percentages.subscribe((data) => (this.progress = Math.floor(data)));
    const state = (await task).state;
    if (state === 'success') {
      ref.getDownloadURL().subscribe(async (profileLink) => {
        await this.store
          .collection('users')
          .doc(this.loggedUser.id)
          .update({ photoUrl: profileLink });
        this.progress = 0;
        this.toastr.showSuccess('Image changed succesfully');
      });
    }
  }

  checkIfValid(file: File): Boolean {
    const validFormat = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    const sizeLimit = this.sizeLimit * 1048576;

    if (!validFormat.includes(file.type)) {
      this.toastr.showWarning('This file is not a good format.');
      return false;
    }

    if (file.size > sizeLimit) {
      this.toastr.showWarning(`Size limit is ${this.sizeLimit} MB`);
      return false;
    }
    return true;
  }

  async updateDescription() {
    if (!this.loggedUser) return;

    const descriptionLimter = new DescriptionLimiter(
      this.loggedUser.description
    );

    const description = descriptionLimter.GetDescription();
    const ref = this.store.collection('users').doc(this.loggedUser.id);
    await ref.update({ description });

    this.editProfile.close();
  }
}
