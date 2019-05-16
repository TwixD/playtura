import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReadingsPage } from './readings.page';
import { PdfViewerModalModule } from '../pdf-viewer/pdf-viewer.module';
import { AuthenticateService } from '../services/authenticate.service';
import { AngularFireAuth } from '@angular/fire/auth';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PdfViewerModalModule,
    RouterModule.forChild([{ path: '', component: ReadingsPage }])
  ],
  declarations: [ReadingsPage],
  providers: [AuthenticateService, AngularFireAuth]
})
export class ReadingsPageModule { }