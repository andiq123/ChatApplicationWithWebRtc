import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { TimeagoModule } from 'ngx-timeago';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireModule } from '@angular/fire';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ToastrComponent } from './shared/toastr/toastr.component';
import { ChatComponent } from './pages/chat/chat.component';
import { SidenavComponent } from './pages/chat/sidenav/sidenav.component';
import { ContactComponent } from './pages/chat/sidenav/contact/contact.component';
import { TalkComponent } from './pages/chat/talk/talk.component';
import { MessageRComponent } from './pages/chat/talk/message-r/message-r.component';
import { MessageLComponent } from './pages/chat/talk/message-l/message-l.component';
import { CallComponent } from './shared/call/call.component';
import { CallingComponent } from './shared/calling/calling.component';
import { AddFriendComponent } from './shared/add-friend/add-friend.component';
import { EditProfileComponent } from './shared/edit-profile/edit-profile.component';
import { StatusActivityComponent } from './shared/status-activity/status-activity.component';
import { InfoUserPopUpComponent } from './shared/info-user-pop-up/info-user-pop-up.component';
import { CommonModule } from '@angular/common';
import { NgxLoadingModule } from 'ngx-loading';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    FooterComponent,
    ToastrComponent,
    ChatComponent,
    SidenavComponent,
    ContactComponent,
    TalkComponent,
    MessageRComponent,
    MessageLComponent,
    CallComponent,
    CallingComponent,
    AddFriendComponent,
    EditProfileComponent,
    StatusActivityComponent,
    InfoUserPopUpComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    TimeagoModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    NgxLoadingModule.forRoot({}),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
