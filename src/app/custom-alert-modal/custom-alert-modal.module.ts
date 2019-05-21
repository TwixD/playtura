import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CustomAlertModal } from './custom-alert-modal';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [CustomAlertModal],
  entryComponents: [CustomAlertModal],
})
export class CustomAlertModalModule { }