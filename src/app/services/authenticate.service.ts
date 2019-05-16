import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { FirebaseService } from './firebase-user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {

  constructor(public afAuth: AngularFireAuth,
    public firebaseService: FirebaseService) {
  }

  registerUser(value) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.auth.createUserWithEmailAndPassword(value.email, value.password)
        .then((userCredential) => {
          let uid: string = firebase.auth().currentUser.uid;
          delete value.password;
          this.firebaseService.addUserID(uid, value).then(() => {
            resolve(uid);
          }).catch((err) => {
            reject(err)
          });
        }, err => reject(err));
    });
  }

  loginUser(value) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(value.email, value.password)
        .then(
          res => resolve(res),
          err => reject(err))
    })
  }

  logoutUser() {
    return new Promise((resolve, reject) => {
      if (this.afAuth.auth.currentUser) {
        this.afAuth.auth.signOut()
          .then(() => {
            resolve();
          }).catch((error) => {
            reject();
          });
      }
    })
  }

  userDetails() {
    return this.afAuth.auth.currentUser;
  }

}