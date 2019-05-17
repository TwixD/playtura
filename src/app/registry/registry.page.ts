import * as _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthenticateService } from '../services/authenticate.service';
import { User } from '../models/user';
import { universidades } from '../options/options';

@Component({
  selector: 'app-registry',
  templateUrl: './registry.page.html',
  styleUrls: ['./registry.page.scss'],
})
export class RegistryPage implements OnInit {

  registryForm: FormGroup;
  universidades: Object = universidades;
  constructor(private nav: NavController,
    private authenticateService: AuthenticateService,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController) {
    this.initFormBuilder();
  }

  ngOnInit() {
  }

  initFormBuilder(): void {
    this.registryForm = this.formBuilder.group({
      name: ['', Validators.compose([Validators.minLength(8), Validators.required])],
      email: ['', Validators.compose([Validators.email, Validators.required])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(16)])],
      college: ['', Validators.compose([Validators.required])],
    });
  }

  async register() {
    if (this.registryForm.valid) {
      let user: User = <User>_.cloneDeep(this.registryForm.getRawValue());
      let loading = await this.presentLoading();
      await loading.present();
      this.authenticateService.registerUser(user).then((res) => {
        loading.dismiss();
        this.nav.navigateRoot('app');
      }).catch((error) => {
        loading.dismiss();
        this.presentToast(this.authenticateServiceError(error));
      });
    }
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'circles',
      message: 'Registrando...',
      backdropDismiss: false,
      translucent: true,
      cssClass: 'custom-loading-registry'
    });
    return loading;
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: 'middle'
    });
    toast.present();
  }

  authenticateServiceError(error): string {
    let response: string = 'Tenemos un problema, intenta nuevamente';
    let code: string = _.has(error, 'code') ? error['code'] : null;
    switch (code) {
      case "auth/email-already-in-use":
        response = 'El correo electrónico ya está en uso';
        break;
    }
    return response;
  }

  back(): void {
    this.nav.navigateBack('login');
  }

}