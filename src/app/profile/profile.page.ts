import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-duration-format';
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
import { User } from '../models/user';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {

  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective>;
  @ViewChild('theSlider') slides;
  @ViewChild('theSliderTop') slidesTop;
  users: Array<User> = [];
  usersById: Object = {};
  user: Object;
  universidades: Object = universidades;
  segmentSelected: string = 'statistics';
  reading: Readings;
  readingTop: Readings;
  readings: Observable<any[]>;
  readingsArray: Array<Readings> = [];
  readingsStatesTop: Array<ReadingStatus> = [];
  statusByReading: Object = {};
  readingsCollectionRef: AngularFirestoreCollection;
  ReadingStatusCollection: AngularFirestoreCollection<ReadingStatus>;
  StatisticsFeedCollection: AngularFirestoreCollection<StatisticsFeed>;
  statisticsFeedSubscription: Subscription;
  readingStatusSubscription: Subscription;
  readingStatusTopSubscription: Subscription;
  readingTime: number = 0;
  readingLevel: number = 0;
  readingLevelProgress: number = 0;
  questionsWithAnswer: Array<Object> = [];
  questionsCorrectAnswers: number = 0;
  levels: Array<number> = [50, 100, 150, 250, 500];
  slideOpts: Object = {
    initialSlide: 0,
    speed: 400
  };
  slideOptsTop: Object = {
    initialSlide: 0,
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

  // summary
  finishingPoints: number = 10;
  summaryFinishingPoints: number = 0;

  constructor(private db: AngularFirestore,
    private authenticateService: AuthenticateService,
    private firebaseService: FirebaseService) {
    moment.locale('es');
    firebaseService.getUsers().subscribe((users) => {
      this.users = users;
      _.forEach(users, (user) => {
        this.usersById[user.id] = user;
      });
    });
    this.readingsCollectionRef = db.collection<Readings>('readings', (ref) => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.orderBy('dateDelivery');
      return query;
    });
    this.loadReadings();
  }

  getUniversity(): string {
    return this.user ?
      (_.has(universidades, this.user['college']) ? universidades[this.user['college']] : 'Universidad') : 'Universidad';
  }

  getUsername(): string {
    return this.user ? this.user['name'] : 'Nombre';
  }

  loadReadings(): void {
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
        this.willChangeSlide({});
      }
    });
  }

  loadReadingStatus(): void {
    if (this.readingStatusSubscription) {
      this.readingStatusSubscription.unsubscribe();
    }
    this.ReadingStatusCollection = this.db.collection<ReadingStatus>('reading-status', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('user', '==', this.authenticateService.userDetails().uid);
      query = query.where('reading', '==', this.reading['id']);
      return query;
    });
    this.readingStatusSubscription = this.ReadingStatusCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ReadingStatus;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe((rs) => {
      this.statusByReading[this.reading['id']] = rs.length > 0 ? rs[0] : null;
      this.getLevel();
      this.loadResults();
      this.loadSummary();
    });
  }

  loadReadingStatusTop(): void {
    if (this.readingStatusTopSubscription) {
      this.readingStatusTopSubscription.unsubscribe();
    }
    this.ReadingStatusCollection = this.db.collection<ReadingStatus>('reading-status', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('reading', '==', this.readingTop['id']);
      return query;
    });
    this.readingStatusTopSubscription = this.ReadingStatusCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ReadingStatus;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe((rs) => {
      let readingStates: Array<ReadingStatus> = _.cloneDeep(rs);
      let sortBy = [{
        prop: 'pointsEarned',
        direction: -1
      }, {
        prop: 'page',
        direction: 1
      }];
      this.orderBy(readingStates, sortBy);
      _.forEach(readingStates, (reading) => {
        reading['userName'] = _.has(this.usersById, reading.user) ? this.usersById[reading.user]['name'] : 'Anónimo';
      });
      this.readingsStatesTop = readingStates;
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
    this.readingTime = 0;
    let uid: string = this.authenticateService.userDetails().uid;
    let iReadData: Array<number> = [];
    let iPointsData: Array<number> = [];
    let averageGroupReading: Array<number> = [];
    let averageGroupPoints: Array<number> = [];
    let fstatisticsFeedByDate = {};
    let groupStatisticsFeedByDate = {};
    _.forEach(statisticsFeed, (feed) => {
      this.readingTime += feed.readingTime;
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
    this.barChartData.push({ data: iReadData, label: 'Yo', backgroundColor: this.barChartColorPersonal });
    this.barChartData.push({ data: averageGroupReading, label: 'Grupo', backgroundColor: this.barChartColorGroup });
    this.barChartPointsData.push({ data: iPointsData, label: 'Yo', backgroundColor: this.barChartColorPersonal });
    this.barChartPointsData.push({ data: averageGroupPoints, label: 'Grupo', backgroundColor: this.barChartColorGroup });
    // Update Manually
    //   this.charts.forEach((child) => {
    //     child.chart.update()
    // });
  }

  loadResults() {
    this.questionsWithAnswer.length = 0;
    this.questionsCorrectAnswers = 0;
    if (_.has(this.statusByReading, this.reading['id'])) {
      let rs: Object = this.statusByReading[this.reading['id']];
      let questionsObject: Object = {};
      _.forEach(this.reading.questions, (question) => {
        questionsObject[question['page']] = question;
      });
      if (_.isObject(rs, 'answers') ? (_.keys(rs['answers']).length > 0 ? true : false) : false) {
        _.forEach(rs['answers'], (answer, key) => {
          if (answer.correct) {
            this.questionsCorrectAnswers += 1;
          }
          this.questionsWithAnswer.push({
            answer: answer,
            question: questionsObject[key]
          });
        });
      }
    }
  }

  loadSummary() {
    if (_.has(this.statusByReading, this.reading['id'])) {
      let rs: Object = this.statusByReading[this.reading['id']];
      // this.summaryFinishingPoints = rs['page'] == rs['totalPages'] ? this.finishingPoints : 0;
    }
  }

  formatReadingTime(): string {
    return moment.duration(this.readingTime, "milliseconds").format("d [dias], h [horas], m [min]", {
      useSignificantDigits: true,
      precision: 0
    });
  }

  getStatusPages(): string {
    let readProg: string = '0/0';
    if (_.isObject(this.reading) ?
      (_.has(this.statusByReading, this.reading['id']) ? _.isObject(this.statusByReading[this.reading['id']]) : false) : false) {
      let status = this.statusByReading[this.reading['id']];
      readProg = `${status['page']}/${status['totalPages']}`;
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

  orderBy(arr: Array<Object>, sortBy: Array<Object>): void {
    arr.sort(function (a, b) {
      let i = 0, result = 0;
      while (i < sortBy.length && result === 0) {
        result = sortBy[i]['direction'] * (a[sortBy[i]['prop']].toString() < b[sortBy[i]['prop']].toString() ? -1 : (a[sortBy[i]['prop']].toString() > b[sortBy[i]['prop']].toString() ? 1 : 0));
        i++;
      }
      return result;
    })
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

  nextRanking(): void {
    this.slidesTop.slideNext();
  }

  backRanking(): void {
    this.slidesTop.slidePrev();
  }

  segmentChanged(ev: any) {
    this.segmentSelected = ev.detail.value;
    if (this.segmentSelected == 'ranking') {
      setTimeout(() => {
        this.willChangeSlideTop({});
      }, 100);
    }
  }

  willChangeSlide(event): void {
    this.slides.getActiveIndex().then((index) => {
      this.reading = this.readingsArray[index];
      this.slideOpts['initialSlide'] = index;
      this.loadReadingStatus();
      this.loadStatisticsFeed();
    });
  }

  willChangeSlideTop(event): void {
    this.slidesTop.getActiveIndex().then((index) => {
      this.readingTop = this.readingsArray[index];
      this.slideOptsTop['initialSlide'] = index;
      this.loadReadingStatusTop();
    });
  }

  ionViewDidEnter() {
    this.firebaseService.getUser(this.authenticateService.userDetails().uid).subscribe((user) => {
      this.user = user;
    });
  }

}