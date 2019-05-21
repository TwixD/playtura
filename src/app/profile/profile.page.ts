import * as _ from 'lodash';
import { Component, ViewChild } from '@angular/core';
import { AuthenticateService } from '../services/authenticate.service';
import { FirebaseService } from '../services/firebase-user.service';
import { universidades } from '../options/options';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { Readings } from '../models/readings';
import { ReadingStatus } from '../models/reading-status';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {

  @ViewChild('theSlider') slides;
  user: Object;
  universidades: Object = universidades;
  segmentSelected: string = 'statistics';
  reading: Readings;
  readings: Observable<any[]>;
  readingsArray: Array<Readings> = [];
  statusByReading: Object = {};
  readingsCollectionRef: AngularFirestoreCollection;
  ReadingStatusCollection: AngularFirestoreCollection<ReadingStatus>;
  readingLevel: number = 0;
  readingLevelProgress: number = 0;
  levels: Array<number> = [200, 400, 600, 800, 1400];
  slideOpts: Object = {
    initialSlide: 1,
    speed: 400
  };
  firstLoad: boolean = true;

  // CHARTS
  barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  barChartLabels: string[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  barChartType: string = 'bar';
  barChartLegend: boolean = true;
  barChartData: any[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  constructor(private db: AngularFirestore,
    private authenticateService: AuthenticateService,
    private firebaseService: FirebaseService) {
    this.readingsCollectionRef = db.collection<Readings>('readings', (ref) => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.orderBy('dateDelivery');
      return query;
    });
    this.loadReadings();
  }

  ionViewDidEnter() {
    let userUID = this.authenticateService.userDetails().uid;
    this.firebaseService.getUser(userUID).subscribe((user) => {
      this.user = user;
    });
  }

  segmentChanged(ev: any) {
    this.segmentSelected = ev.detail.value;
  }

  getUniversity(): string {
    return this.user ?
      (_.has(universidades, this.user['college']) ? universidades[this.user['college']] : 'Universidad') : 'Universidad';
  }

  loadReadings() {
    this.readings = this.readingsCollectionRef.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Readings;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    this.readings.subscribe((readings) => {
      this.readingsArray = readings;
      if (this.firstLoad) {
        this.slides.slideTo(0);
        this.firstLoad = false;
      }
      console.log(readings);
    });
  }

  loadReadingStatus(): void {
    this.ReadingStatusCollection = this.db.collection<ReadingStatus>('reading-status', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('user', '==', this.authenticateService.userDetails().uid);
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
      this.statusByReading[this.reading['id']] = rs.length > 0 ? rs[0] : null;
      this.getLevel();
    });
  }

  getStatusPages(): string {
    let readProg: string = '0/0pág';
    if (_.isObject(this.reading) ?
      (_.has(this.statusByReading, this.reading['id']) ? _.isObject(this.statusByReading[this.reading['id']]) : false) : false) {
      let status = this.statusByReading[this.reading['id']];
      readProg = `${status['page']}/${status['totalPages']}pág`;
    }
    return readProg;
  }

  getStatusPoints(): number {
    let readPts: number = 0;
    if (_.isObject(this.reading) ?
      (_.has(this.statusByReading, this.reading['id']) ? _.isObject(this.statusByReading[this.reading['id']]) : false) : false) {
      let status = this.statusByReading[this.reading['id']];
      readPts = Number(status['pointsEarned']);
    }
    return readPts;
  }

  getLevel(): void {
    this.readingLevel = 0;
    this.readingLevelProgress = 0;
    if (_.isObject(this.reading) ?
      (_.has(this.statusByReading, this.reading['id']) ? _.isObject(this.statusByReading[this.reading['id']]) : false) : false) {
      let status = this.statusByReading[this.reading['id']];
      for (let index = 0; index < this.levels.length; index++) {
        const element = this.levels[index];
        if (status['pointsEarned'] <= element) {
          this.readingLevel = index;
          let perc: number = _.isNumber(status['pointsEarned']) && _.isFinite(status['pointsEarned']) ?
            (Number(((status['pointsEarned'] * 100) / element).toFixed(0))) : 0;
          this.readingLevelProgress = perc > 0 ? (perc / 100) : 0;
          break;
        }
      }
    }
  }

  next(): void {
    this.slides.slideNext();
  }

  back(): void {
    this.slides.slidePrev();
  }

  willChangeSlide(event): void {
    this.slides.getActiveIndex().then((index) => {
      this.reading = this.readingsArray[index];
      this.loadReadingStatus();
    });
  }

}