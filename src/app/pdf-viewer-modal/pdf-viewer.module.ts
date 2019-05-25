import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PdfViewerModal } from './pdf-viewer.modal';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { AuthenticateService } from '../services/authenticate.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { CustomAlertQuestionModalModule } from '../custom-alert-question-modal/custom-alert-question-modal.module';
import { CustomAlertAnswerModalModule } from '../custom-alert-answer-modal/custom-alert-answer-modal.module';

@NgModule({
  declarations: [
    PdfViewerModal
  ],
  imports: [
    IonicModule,
    CommonModule,
    PdfViewerModule,
    CustomAlertQuestionModalModule,
    CustomAlertAnswerModalModule
  ],
  entryComponents: [
    PdfViewerModal
  ],
  providers: [AuthenticateService, AngularFireAuth]
})
export class PdfViewerModalModule { }