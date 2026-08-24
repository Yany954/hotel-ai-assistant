import "dotenv/config";
import { getAuth } from "firebase-admin/auth";
import "./infrastructure/persistence/firestore/init"; 

async function makeAdmin() {
  const uid = "VyCUzzwdzGhkccvP1bvu0fvTpwE2";
  await getAuth().setCustomUserClaims(uid, { role: "admin" });
  console.log("¡Custom Claim asignado con éxito!");
}

makeAdmin();