import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CustomAlertAnswerModal } from './custom-alert-answer-modal.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [CustomAlertAnswerModal],
  entryComponents: [CustomAlertAnswerModal],
})
export class CustomAlertAnswerModalModule { }