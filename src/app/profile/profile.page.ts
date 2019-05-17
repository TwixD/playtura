import * as _ from 'lodash';
import { Component } from '@angular/core';
import { AuthenticateService } from '../services/authenticate.service';
import { FirebaseService } from '../services/firebase-user.service';
import { universidades } from '../options/options';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {

  user: Object;
  universidades: Object = universidades;
  segmentSelected: string = 'statistics';

  constructor(private authenticateService: AuthenticateService,
    private firebaseService: FirebaseService) {
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

}