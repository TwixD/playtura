import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CustomAlertQuestionModal } from './custom-alert-question-modal';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [CustomAlertQuestionModal],
  entryComponents: [CustomAlertQuestionModal],
})
export class CustomAlertQuestionModalModule { }