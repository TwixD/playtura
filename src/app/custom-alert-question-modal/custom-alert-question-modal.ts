import * as _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Readings } from '../models/readings';

@Component({
  selector: 'app-custom-alert-question-modal',
  templateUrl: './custom-alert-question-modal.html',
  styleUrls: ['./custom-alert-question-modal.scss'],
})
export class CustomAlertQuestionModal implements OnInit {

  reading: Readings;
  question: Object;
  questionIndex: number = 0;
  pageOf: string = '0/0';
  porc: number = 0;
  answerSelected: number = -1;

  constructor(private modalCtrl: ModalController,
    private navParams: NavParams) {
    this.reading = this.navParams.get('reading');
    this.question = this.navParams.get('question');
    _.forEach(this.reading.questions, (question, index) => {
      if (this.question['id'] === question['id']) {
        this.questionIndex = index;
      }
    });
    this.pageOf = `${this.questionIndex + 1}/${this.reading.questions.length}`;
    this.porc = Number((((this.questionIndex + 1) * 100) / this.reading.questions.length).toFixed(0)) / 100;
  }

  ngOnInit() { }

  clickAnswer(answer: number) {
    this.answerSelected = answer;
  }

  answer() {
    this.modalCtrl.dismiss(this.answerSelected);
  }

  back() {
    this.modalCtrl.dismiss();
  }

}