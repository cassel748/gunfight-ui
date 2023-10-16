import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import "firebase/auth";
import { firebaseConfig } from "./auth";
import { getFirebaseAdmin } from "next-firebase-auth";

export default class Firebase {
  static query(ref, limit, dbRef) {
    return new Promise(async (resolve) => {
      if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
      }

      const dbRefLocal = dbRef ? dbRef : firebase.firestore();
      let snapshots = null;

      if (limit) {
        snapshots = await dbRefLocal.collection(ref).limit(limit).get();
      } else {
        snapshots = await dbRefLocal.collection(ref).get();
      }

      const documents = [];
      snapshots.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return resolve(documents);
    })
  }

  static save(ref, id, data, dbRef) {
    return Promise(async (resolve) => {
      const dbRefLocal = dbRef ? dbRef : firebase.firestore();
      const newItemRef = dbRefLocal.collection(ref).doc(id);

      await newItemRef.set(data);
      resolve(true);
    });
  }

  static loginWithEmailAndPassword(email, password, authRef) {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }

    const authRefLocal = authRef ? authRef : firebase.auth();
    return authRefLocal.signInWithEmailAndPassword(email, password);
  }

  static createUserWithEmailAndPassword(email, password, authRef) {
    const authRefLocal = authRef ? authRef : firebase.auth();
    return authRefLocal.createUserWithEmailAndPassword(email, password);
  }

  static getDataById(ref, id, dbRef) {
    return new Promise((resolve, reject) => {
      const dbRefLocal = dbRef ? dbRef : firebase.firestore();
      const docRef = dbRefLocal.collection(ref).doc(id);

      docRef.get().then((doc) => {
        if (doc.exists) {
            resolve({
              id: doc.id,
              docId: doc.id,
              ...doc.data()
            });
        } else {
            reject("No such document!");
        }
      }).catch((error) => {
        reject("Error getting document:", error);
      });
    });
  }

  static async getCount(ref) {
    const db = getFirebaseAdmin().firestore();
    const countRef = await db.collection("counts").doc(ref).get();
    const count = countRef.data().count;
    return count;
  }

  static async updateCount(type, ref) {
    const db = getFirebaseAdmin().firestore();
    const associateData = await db.collection("counts").doc(ref).get();
    const count = associateData.data().count;
  
    let updateCount = null;
  
    if (type === "+") {
      updateCount = count + 1;
    }
  
    if (type === "-") {
      updateCount = count - 1;
    }
  
    await db.collection("counts").doc(ref).update({
      count: updateCount
    });
  };
}
