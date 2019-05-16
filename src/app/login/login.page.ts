import * as _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { AuthenticateService } from '../services/authenticate.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;

  constructor(private nav: NavController,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authenticateService: AuthenticateService) {
    this.initFormBuilder();
  }

  ngOnInit() {
  }

  initFormBuilder(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.email, Validators.required])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(16)])],
    });
  }

  registry() {
    this.nav.navigateForward('/registry');
  }

  async ahead() {
    if (this.loginForm.valid) {
      let credentials: Object = _.cloneDeep(this.loginForm.getRawValue());
      let loading = await this.presentLoading();
      await loading.present();
      this.authenticateService.loginUser(credentials).then((res) => {
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
      position: 'bottom'
    });
    toast.present();
  }

  authenticateServiceError(error): string {
    let response: string = 'Tenemos un problema, intenta nuevamente';
    let code: string = _.has(error, 'code') ? error['code'] : null;
    switch (code) {
      case "auth/user-not-found":
        response = 'El correo no se encuentra registrado.';
        break;
      case "auth/wrong-password":
        response = 'Contraseña inválida.';
        break;
    }
    return response;
  }

}