import React from 'react'

const test = () => {

    async function getUserData(uid) {
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          return docSnap.data();
        } else {
          console.log("No such document!");
        }
      }
      
  return (
    <div>
      
    </div>
  )
}

export default test
