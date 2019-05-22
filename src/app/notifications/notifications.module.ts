import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationsPage } from './notifications.page';
import { AuthenticateService } from '../services/authenticate.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { PdfViewerModalModule } from '../pdf-viewer-modal/pdf-viewer.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PdfViewerModalModule,
    RouterModule.forChild([{ path: '', component: NotificationsPage }])
  ],
  declarations: [NotificationsPage],
  providers: [AuthenticateService, AngularFireAuth]
})
export class NotificationsPageModule { }