import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfilePage } from './profile.page';
import { AuthenticateService } from '../services/authenticate.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { FirebaseService } from '../services/firebase-user.service';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ChartsModule,
    RouterModule.forChild([{ path: '', component: ProfilePage }])
  ],
  declarations: [ProfilePage],
  providers: [FirebaseService, AuthenticateService, AngularFireAuth]
})
export class ProfilePageModule { }