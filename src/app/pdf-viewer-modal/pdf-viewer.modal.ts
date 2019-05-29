import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-duration-format';
import { Component } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { Readings } from '../models/readings';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { ReadingStatus } from '../models/reading-status';
import { AuthenticateService } from '../services/authenticate.service';
import { map, first } from 'rxjs/operators';
import { StatisticsFeed } from '../models/statistics-feed';
import { CustomAlertQuestionModal } from '../custom-alert-question-modal/custom-alert-question-modal';
import { CustomAlertAnswerModal } from '../custom-alert-answer-modal/custom-alert-answer-modal.component';
import { CustomAlertFinishModal } from '../custom-alert-finish-modal/custom-alert-finish-modal';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.modal.html',
  styleUrls: ['./pdf-viewer.modal.scss'],
})
export class PdfViewerModal {

  ReadingStatusCollection: AngularFirestoreCollection<ReadingStatus>;
  StatisticsFeedCollection: AngularFirestoreCollection<StatisticsFeed>;
  reading: Readings;
  readingStatus: ReadingStatus;
  totalPages: number;
  page: number = 1;
  isLoaded: boolean = false;
  questions: Object = {};
  user: any;
  isLoadedReadingStatus: boolean = false;
  setPage: boolean = false;
  timer: any;
  timerTop: number = 0;

  constructor(private modalCtrl: ModalController,
    private db: AngularFirestore,
    private navParams: NavParams,
    private authenticateService: AuthenticateService) {
    this.user = this.authenticateService.userDetails();
    this.reading = this.navParams.get('reading');
    this.loadQuestions();
    this.StatisticsFeedCollection = db.collection<StatisticsFeed>('statistics-feed', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('user', '==', this.user.uid);
      query = query.where('reading', '==', this.reading['id']);
      query = query.where('date', '==', new Date(new Date().setHours(0, 0, 0, 0)));
      return query;
    });
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

  getTimer(): string {
    return moment.duration(this.timerTop, "milliseconds").format("mm:ss");
  }

  loadQuestions(): void {
    if (_.isArray(this.reading.questions)) {
      _.forEach(this.reading.questions, (question) => {
        this.questions[question['page']] = question;
      });
    }
  }

  async presentAlertRadio(question: Object) {
    const modal = await this.modalCtrl.create({
      component: CustomAlertQuestionModal,
      backdropDismiss: false,
      componentProps: {
        reading: this.reading,
        question: question
      },
      cssClass: 'my-custom-modal-question-css'
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (typeof (data) === 'undefined') {
      this.previousPage();
    } else {
      this.saveReadingStatus(question, data);
    }
  }

  async saveReadingStatus(question?: Object, res?: number) {
    let newReadingStatus: ReadingStatus = this.readingStatus || {
      user: this.user.uid,
      reading: this.reading['id'],
      page: this.page,
      totalPages: this.totalPages,
      percentage: Number(((this.page * 100) / this.totalPages).toFixed(0)),
      pointsEarned: 0,
      answers: {}
    };
    if (_.has(newReadingStatus, 'id')) {
      if (this.page > newReadingStatus.page || _.isObject(question)) {
        let pointsEarned: number = 0;
        newReadingStatus.page = this.page;
        newReadingStatus.percentage = Number(((this.page * 100) / this.totalPages).toFixed(0));
        if (_.isObject(question)) {
          if (!_.has(newReadingStatus.answers, this.page)) {
            let correct: boolean = question['correctAnswer'] == String(res) ? true : false;
            let questionPoints: number = Number(question['points']) || 0;
            newReadingStatus.pointsEarned = correct ? (newReadingStatus.pointsEarned + questionPoints) : newReadingStatus.pointsEarned;
            newReadingStatus.answers[this.page] = {
              questionId: question['id'],
              answer: String(res),
              correct: correct
            };
            pointsEarned = correct ? questionPoints : 0;
            const modal = await this.modalCtrl.create({
              component: CustomAlertAnswerModal,
              backdropDismiss: false,
              componentProps: {
                correct: correct,
                points: pointsEarned,
              },
              cssClass: 'my-custom-modal-css'
            });
            modal.present();
          }
        }
        this.updateStatisticsFeed(pointsEarned, _.isObject(question) ? 0 : 1);
        await this.ReadingStatusCollection.doc(newReadingStatus['id']).set(newReadingStatus);
      }
    } else {
      this.updateStatisticsFeed();
      await this.ReadingStatusCollection.add(newReadingStatus);
    }
  }

  updateStatisticsFeed(pointsEarned: number = 0, pagesRead: number = 1) {
    this.StatisticsFeedCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as StatisticsFeed;
        const id = a.payload.doc.id;
        return { id, ...data };
      })),
      first()
    ).subscribe((rs) => {
      let newTimer: any = new Date();
      let statisticsFeed: StatisticsFeed = rs.length > 0 ? rs[0] : {
        user: this.user.uid,
        reading: this.reading['id'],
        date: new Date(new Date().setHours(0, 0, 0, 0)),
        pagesRead: 1,
        pointsEarned: 0,
        readingTime: 0
      };
      statisticsFeed.pointsEarned += pointsEarned;
      statisticsFeed.pagesRead += pagesRead;
      statisticsFeed.readingTime += Math.abs(this.timer.getTime() - newTimer.getTime());
      this.timer = newTimer;
      if (rs.length > 0) {
        this.StatisticsFeedCollection.doc(statisticsFeed.id).update(statisticsFeed);
      } else {
        this.StatisticsFeedCollection.add(statisticsFeed);
      }
    });
  }

  async finish() {
    const modal = await this.modalCtrl.create({
      component: CustomAlertFinishModal,
      backdropDismiss: false,
      componentProps: {
        reading: this.reading,
        readingStatus: this.readingStatus
      },
      cssClass: 'my-custom-modal-finish-css'
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    this.updateStatisticsFeed(data, 0);
    this.close();
  }

  nextPage(): void {
    this.page += 1;
    if (this.page == this.totalPages && this.readingStatus.page !== this.totalPages) {
      this.finish();
    }
    this.saveReadingStatus();
    if (_.has(this.questions, this.page) && (_.isObject(this.readingStatus) ? !_.has(this.readingStatus.answers, this.page) : false)) {
      this.presentAlertRadio(this.questions[this.page]);
    }
  }

  previousPage(): void {
    this.page -= 1;
  }

  getProgress(): number {
    return Number(((this.page * 100) / this.totalPages).toFixed(0)) / 100;
  }

  afterLoadComplete(pdfData: any) {
    this.totalPages = pdfData.numPages;
    this.isLoaded = true;
    this.timer = new Date();
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