import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PdfViewerModal } from './pdf-viewer.modal';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { AuthenticateService } from '../services/authenticate.service';
import { AngularFireAuth } from '@angular/fire/auth';

@NgModule({
  declarations: [
    PdfViewerModal
  ],
  imports: [
    IonicModule,
    CommonModule,
    PdfViewerModule
  ],
  entryComponents: [
    PdfViewerModal
  ],
  providers: [AuthenticateService, AngularFireAuth]
})
export class PdfViewerModalModule { }