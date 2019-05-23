import * as _ from 'lodash';
import * as moment from "moment";
import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { AuthenticateService } from '../services/authenticate.service';
import { FirebaseService } from '../services/firebase-user.service';
import { universidades } from '../options/options';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { Readings } from '../models/readings';
import { ReadingStatus } from '../models/reading-status';
import { StatisticsFeed } from '../models/statistics-feed';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {

  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective>;
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
  StatisticsFeedCollection: AngularFirestoreCollection<StatisticsFeed>;
  statisticsFeedSubscription: Subscription;
  readingLevel: number = 0;
  readingLevelProgress: number = 0;
  levels: Array<number> = [200, 400, 600, 800, 1400];
  slideOpts: Object = {
    initialSlide: 1,
    speed: 400
  };
  firstLoad: boolean = true;

  // CHARTS
  barChartType: string = 'bar';
  barChartLegend: boolean = true;
  barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  barChartLabels: string[] = [''];
  barChartData: any[] = [{ data: [0], label: '' }];
  barChartPointsData: any[] = [{ data: [0], label: '' }];
  barChartColorPersonal: string = 'rgba(81, 219, 252, 1)';
  barChartColorGroup: string = 'rgba(89, 124, 251, 1)';

  constructor(private db: AngularFirestore,
    private authenticateService: AuthenticateService,
    private firebaseService: FirebaseService) {
    moment.locale('es');
    this.readingsCollectionRef = db.collection<Readings>('readings', (ref) => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.orderBy('dateDelivery');
      return query;
    });
    this.loadReadings();
  }

  ionViewDidEnter() {
    this.firebaseService.getUser(this.authenticateService.userDetails().uid).subscribe((user) => {
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

  loadStatisticsFeed(): void {
    if (this.statisticsFeedSubscription) {
      this.statisticsFeedSubscription.unsubscribe();
    }
    var startWeek: any = new Date();
    startWeek.setDate(startWeek.getDate() - 5);
    startWeek.setHours(0, 0, 0, 0);
    this.StatisticsFeedCollection = this.db.collection<StatisticsFeed>('statistics-feed', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('reading', '==', this.reading['id']);
      query = query.where('date', '>=', new Date(startWeek));
      return query;
    });
    this.statisticsFeedSubscription = this.StatisticsFeedCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as StatisticsFeed;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe((rs) => {
      this.loadReadPagesChart(rs);
    });
  }

  loadReadPagesChart(statisticsFeed: Array<StatisticsFeed>) {
    this.barChartLabels.length = 0;
    this.barChartData.length = 0;
    this.barChartPointsData.length = 0;
    let uid: string = this.authenticateService.userDetails().uid;
    let iReadData: Array<number> = [];
    let iPointsData: Array<number> = [];
    let averageGroupReading: Array<number> = [];
    let averageGroupPoints: Array<number> = [];
    let fstatisticsFeedByDate = {};
    let groupStatisticsFeedByDate = {};
    _.forEach(statisticsFeed, (feed) => {
      feed.date = new Date(feed.date.seconds * 1000);
      let dateFormat: string = moment(feed.date).format('MM/DD/YYYY');
      if (feed.user == uid) {
        fstatisticsFeedByDate[dateFormat] = feed;
      } else {
        groupStatisticsFeedByDate[dateFormat] = _.has(groupStatisticsFeedByDate, dateFormat) ? groupStatisticsFeedByDate[dateFormat] :
          { readPages: 0, pointsEarned: 0, counter: 0 };
        groupStatisticsFeedByDate[dateFormat]['readPages'] += feed['pagesRead'];
        groupStatisticsFeedByDate[dateFormat]['pointsEarned'] += feed['pointsEarned'];
        groupStatisticsFeedByDate[dateFormat]['counter'] += 1;
      }
    });
    var startWeek: any = new Date();
    startWeek.setDate(startWeek.getDate() - 6);
    for (let index = 0; index < 6; index++) {
      startWeek.setDate(startWeek.getDate() + 1);
      let dayName: string = moment(startWeek).format('ddd');
      dayName = _.toUpper(dayName.substring(0, dayName.length - 1));
      this.barChartLabels.push(dayName);
      let startWeekFormatted: string = moment(startWeek).format('MM/DD/YYYY');
      iReadData.push(_.has(fstatisticsFeedByDate, startWeekFormatted) ? fstatisticsFeedByDate[startWeekFormatted]['pagesRead'] : 0);
      iPointsData.push(_.has(fstatisticsFeedByDate, startWeekFormatted) ? fstatisticsFeedByDate[startWeekFormatted]['pointsEarned'] : 0);
      let avgReading: number = 0;
      let avgPoints: number = 0;
      if (_.has(groupStatisticsFeedByDate, startWeekFormatted)) {
        let groupStatistics: Object = groupStatisticsFeedByDate[startWeekFormatted];
        avgReading = groupStatistics['counter'] > 0 && groupStatistics['readPages'] > 0 ?
          (Number((groupStatistics['readPages'] / groupStatistics['counter']).toFixed(0))) : 0;
        avgPoints = groupStatistics['counter'] > 0 && groupStatistics['pointsEarned'] > 0 ?
          (Number((groupStatistics['pointsEarned'] / groupStatistics['counter']).toFixed(0))) : 0;
      }
      averageGroupReading.push(avgReading);
      averageGroupPoints.push(avgPoints);
    }
    this.barChartData.push({ data: iReadData, label: 'PERSONAL', backgroundColor: this.barChartColorPersonal });
    this.barChartData.push({ data: averageGroupReading, label: 'GRUPO', backgroundColor: this.barChartColorGroup });
    this.barChartPointsData.push({ data: iPointsData, label: 'PERSONAL', backgroundColor: this.barChartColorPersonal });
    this.barChartPointsData.push({ data: averageGroupPoints, label: 'GRUPO', backgroundColor: this.barChartColorGroup });
    // Update Manually
    //   this.charts.forEach((child) => {
    //     child.chart.update()
    // });
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
      this.loadStatisticsFeed();
    });
  }

}