import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CustomAlertFinishModal } from './custom-alert-finish-modal';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [CustomAlertFinishModal],
  entryComponents: [CustomAlertFinishModal],
})
export class CustomAlertFinishModalModule { }