import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-custom-alert-modal',
  templateUrl: './custom-alert-modal.html',
  styleUrls: ['./custom-alert-modal.scss'],
})
export class CustomAlertModal implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  close() {
    this.modalCtrl.dismiss();
  }

}
