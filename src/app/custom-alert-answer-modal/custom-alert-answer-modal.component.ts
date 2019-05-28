import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-custom-alert-answer-modal',
  templateUrl: './custom-alert-answer-modal.component.html',
  styleUrls: ['./custom-alert-answer-modal.component.scss'],
})
export class CustomAlertAnswerModal implements OnInit {

  correct: boolean = true;
  points: number = 0;
  img: string = 'assets/img/Frame.png';
  title: string = '+ 0';
  subtitle: string = '¡Tu respuesta es correcta!';
  buttonColor: string = 'greenman';

  constructor(private modalCtrl: ModalController,
    navParams: NavParams) {
    this.correct = navParams.get('correct');
    this.points = navParams.get('points') || 0;
    this.title = `+ ${this.points}`;
    if (!this.correct) {
      this.title = '+ 0';
      this.subtitle = 'Respuesta incorrecta';
      this.buttonColor = 'redman';
      this.img = 'assets/img/playto.png';
    }
  }

  ngOnInit() { }

  close() {
    this.modalCtrl.dismiss();
  }

}