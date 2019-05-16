import * as _ from 'lodash';
import { Component } from '@angular/core';
import { NavParams, ModalController, AlertController } from '@ionic/angular';
import { Readings } from '../models/readings';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { ReadingStatus } from '../models/reading-status';
import { AuthenticateService } from '../services/authenticate.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.modal.html',
  styleUrls: ['./pdf-viewer.modal.scss'],
})
export class PdfViewerModal {

  ReadingStatusCollection: AngularFirestoreCollection<ReadingStatus>;
  reading: Readings;
  readingStatus: ReadingStatus;
  totalPages: number;
  page: number = 1;
  isLoaded: boolean = false;
  questions: Object = {};
  user: any;
  isLoadedReadingStatus: boolean = false;
  setPage: boolean = false;

  constructor(private modalCtrl: ModalController,
    private db: AngularFirestore,
    private navParams: NavParams,
    private alertController: AlertController,
    private authenticateService: AuthenticateService) {
    this.user = this.authenticateService.userDetails();
    this.reading = this.navParams.get('reading');
    this.loadQuestions();
    this.ReadingStatusCollection = db.collection<ReadingStatus>('reading-status', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('user', '==', this.user.uid);
      query = query.where('reading', '==', this.reading['id']);
      return query;
    });
    this.ReadingStatusCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ReadingStatus;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe((rs) => {
      this.readingStatus = rs.length > 0 ? rs[0] : null;
      if (_.isObject(this.readingStatus) && !this.isLoadedReadingStatus) {
        if (this.isLoaded) {
          this.page = this.readingStatus.page;
        } else {
          this.setPage = true;
        }
      }
      this.isLoadedReadingStatus = true;
    });
  }

  loadQuestions(): void {
    if (_.isArray(this.reading.questions)) {
      _.forEach(this.reading.questions, (question) => {
        this.questions[question['page']] = question;
      });
    }
  }

  async presentAlertRadio(question: Object) {
    let inputs: Array<Object> = [];
    if (_.isArray(question['answerOptions'])) {
      _.forEach(question['answerOptions'], (questionOption, key) => {
        inputs.push({
          name: `radio${key}`,
          type: 'radio',
          label: questionOption,
          value: key,
          checked: (key == 0 ? true : false)
        });
        this.questions[question['page']] = question;
      });
    }
    const alert = await this.alertController.create({
      header: question['question'],
      inputs: inputs,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Ok',
          handler: (res) => {
            this.saveReadingStatus(question, res);
          }
        }
      ]
    });
    await alert.present();
  }

  async saveReadingStatus(question?: Object, res?: number) {
    let newReadingStatus: ReadingStatus = this.readingStatus || {
      user: this.user.uid,
      reading: this.reading['id'],
      page: this.page,
      totalPages: this.totalPages,
      percentage: Number(((this.page * 100) / this.totalPages).toFixed(0)),
      answers: {}
    };
    if (_.has(newReadingStatus, 'id')) {
      if (this.page > newReadingStatus.page || _.isObject(question)) {
        newReadingStatus.page = this.page;
        newReadingStatus.percentage = Number(((this.page * 100) / this.totalPages).toFixed(0));
        if (_.isObject(question)) {
          if (!_.has(newReadingStatus.answers, this.page)) {
            newReadingStatus.answers[this.page] = {
              questionId: question['id'],
              answer: String(res),
              correct: question['correctAnswer'] == String(res) ? true : false
            };
          }
        }
        await this.ReadingStatusCollection.doc(newReadingStatus['id']).set(newReadingStatus);
      }
    } else {
      await this.ReadingStatusCollection.add(newReadingStatus);
    }
  }

  nextPage(): void {
    this.page += 1;
    this.saveReadingStatus();
    if (_.has(this.questions, this.page) && (_.isObject(this.readingStatus) ? !_.has(this.readingStatus.answers, this.page) : false)) {
      this.presentAlertRadio(this.questions[this.page]);
    }
  }

  previousPage(): void {
    this.page -= 1;
  }

  afterLoadComplete(pdfData: any) {
    this.totalPages = pdfData.numPages;
    this.isLoaded = true;
    if (this.setPage) {
      setTimeout(() => {
        this.page = this.readingStatus.page;
      }, 50)
      this.setPage = false;
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

}