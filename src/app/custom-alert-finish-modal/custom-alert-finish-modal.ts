import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { Readings } from '../models/readings';
import { ReadingStatus } from '../models/reading-status';

@Component({
  selector: 'app-custom-alert-finish-modal',
  templateUrl: './custom-alert-finish-modal.html',
  styleUrls: ['./custom-alert-finish-modal.scss'],
})
export class CustomAlertFinishModal implements OnInit {

  reading: Readings;
  readingStatus: ReadingStatus;
  perfectScore: boolean = false;
  perfectScorePoints: number = 20;
  finishingPoints: number = 10;
  correctAnswersPoints: number = 0;
  total: number = 0;

  constructor(navParams: NavParams,
    private modalCtrl: ModalController) {
    this.reading = navParams.get('reading');
    this.readingStatus = navParams.get('readingStatus');
    this.perfectScore = this.reading.points == this.readingStatus.pointsEarned ? true : false;
    this.correctAnswersPoints = this.readingStatus.pointsEarned || 0;
    this.total += this.finishingPoints;
    this.total += this.perfectScore ? this.perfectScorePoints : 0;
    this.total += this.correctAnswersPoints;
  }

  ngOnInit() { }

  close() {
    this.modalCtrl.dismiss((this.perfectScore ? this.perfectScorePoints : 0) + this.finishingPoints);
  }

}