import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private userCollection: AngularFirestoreCollection<User>;
  private users: Observable<User[]>;

  constructor(db: AngularFirestore) {
    this.userCollection = db.collection<User>('users');
    this.users = this.userCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  getUsers() {
    return this.users;
  }

  getUser(id) {
    return this.userCollection.doc<User>(id).valueChanges();
  }

  updateUser(user: User, id: string): Promise<any> {
    return this.userCollection.doc(id).update(user);
  }

  addUser(user: User): Promise<any> {
    return this.userCollection.add(user);
  }

  addUserID(uid: string, user: User): Promise<any> {
    return this.userCollection.doc(uid).set(user);
  }

  removeUser(id) {
    return this.userCollection.doc(id).delete();
  }

}