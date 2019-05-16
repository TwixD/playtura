import * as _ from 'lodash';
import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Readings } from '../models/readings';
import { ReadingStatus } from '../models/reading-status';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { PdfViewerModal } from '../pdf-viewer/pdf-viewer.modal';
import { map } from 'rxjs/operators';
import { AuthenticateService } from '../services/authenticate.service';

@Component({
  selector: 'app-readings',
  templateUrl: 'readings.page.html',
  styleUrls: ['readings.page.scss']
})
export class ReadingsPage {

  ReadingStatusCollection: AngularFirestoreCollection<ReadingStatus>;
  readingsCollectionRef: AngularFirestoreCollection;
  readings: Observable<any[]>;
  statusByReading: Object = {};
  status: Array<Object> = [
    {
      label: 'Importante',
      days: 10
    },
    {
      label: 'Urgente',
      days: 4
    },
  ];

  constructor(private db: AngularFirestore,
    private modalController: ModalController,
    private authenticateService: AuthenticateService) {
    this.readingsCollectionRef = db.collection<Readings>('readings', (ref) => ref.orderBy('dateDelivery'));
    this.readings = this.readingsCollectionRef.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Readings;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    this.loadReadingStatus();
  }

  async openPDF(reading: Object) {
    const modal = await this.modalController.create({
      component: PdfViewerModal,
      componentProps: { reading }
    });
    return await modal.present();
  }

  readingStatus(reading: Object): string {
    let selectedType: string = 'No prioritaria';
    let dateNowSeconds: number = new Date().getTime() / 1000;
    let readingDateDelivery: number = reading['dateDelivery']['seconds'];
    let diff: number = readingDateDelivery - dateNowSeconds;
    _.forEach(this.status, (st) => {
      let daySeconds: number = st['days'] * 86400;
      if (diff <= daySeconds) {
        selectedType = st['label'];
      }
    });
    return selectedType;
  }

  loadReadingStatus(): void {
    this.readings.subscribe((readings) => {
      _.forEach(readings, (reading) => {
        this.ReadingStatusCollection = this.db.collection<ReadingStatus>('reading-status', ref => {
          let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
          query = query.where('user', '==', this.authenticateService.userDetails().uid);
          query = query.where('reading', '==', reading['id']);
          return query;
        });
        this.ReadingStatusCollection.snapshotChanges().pipe(
          map(actions => actions.map(a => {
            const data = a.payload.doc.data() as ReadingStatus;
            const id = a.payload.doc.id;
            return { id, ...data };
          }))
        ).subscribe((rs) => {
          this.statusByReading[reading.id] = rs.length > 0 ? rs[0] : null;
        });
      });
    });
  }

  getReadingStatusPage(reading: Readings): string {
    let status: string = 'Sin comenzar';
    if (_.has(this.statusByReading, reading['id']) ?
      (_.isObject(this.statusByReading[reading['id']]) ? true : false) : false) {
      status = `Página ${this.statusByReading[reading['id']]['page']} de ${this.statusByReading[reading['id']]['totalPages']}`;
    }
    return status;
  }

}