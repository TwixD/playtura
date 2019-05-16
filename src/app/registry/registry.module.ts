import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RegistryPage } from './registry.page';
import { FirebaseService } from '../services/firebase-user.service';
import { FormErrorHandlerComponent } from '../form-error-handler/form-error-handler.component';
import { AuthenticateService } from '../services/authenticate.service';
import { AngularFireAuth } from '@angular/fire/auth';

const routes: Routes = [
  {
    path: '',
    component: RegistryPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [FormErrorHandlerComponent],
  declarations: [RegistryPage, FormErrorHandlerComponent],
  providers: [FirebaseService, AuthenticateService, AngularFireAuth]
})
export class RegistryPageModule { }