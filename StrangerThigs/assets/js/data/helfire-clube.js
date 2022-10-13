import { addDoc, collection, getFirestore } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js'
import app from './firebase.js'

/**
 * It takes a subscribe object, gets a firestore instance, gets a collection reference, adds a document
 * to the collection, and returns the document id.
 * @param subscribe - {
 * @returns The id of the document that was created.
 */
export async function subscribeToHellfireClube(subscribe) {
    const db = getFirestore(app)
    const hellfireClubCollection = collection(db, 'hellfire-clube')
    const docRef = await addDoc(hellfireClubCollection, subscribe)
    return docRef.id
}
