import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyCoC3--K0e-bKoeBJ1e8K9E3l5C7pTuOKI",
    authDomain: "tarefasplus-ba2fa.firebaseapp.com",
    projectId: "tarefasplus-ba2fa",
    storageBucket: "tarefasplus-ba2fa.appspot.com",
    messagingSenderId: "972045158836",
    appId: "1:972045158836:web:dca569bf06b2b7efa0cae1"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp)

export { db };