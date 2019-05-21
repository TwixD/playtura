import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReadingsPage } from './readings.page';
import { AuthenticateService } from '../services/authenticate.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { PdfViewerModalModule } from '../pdf-viewer-modal/pdf-viewer.module';
import { CustomAlertModalModule } from '../custom-alert-modal/custom-alert-modal.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PdfViewerModalModule,
    CustomAlertModalModule,
    RouterModule.forChild([{ path: '', component: ReadingsPage }])
  ],
  declarations: [ReadingsPage],
  providers: [AuthenticateService, AngularFireAuth]
})
export class ReadingsPageModule { }