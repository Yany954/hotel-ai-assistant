import "dotenv/config";
import { getAuth } from "firebase-admin/auth";
import "./infrastructure/persistence/firestore/init"; 

async function makeAdmin() {
  const uid = "DJN5LQiklGejPr092MoxgdT5JEq1";
  await getAuth().setCustomUserClaims(uid, { role: "admin" });
  console.log("¡Custom Claim asignado con éxito!");
}

makeAdmin();