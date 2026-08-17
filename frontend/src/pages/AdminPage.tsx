import { useEffect, useState } from "react";
import { Contact} from "../types/contact";
import { Room } from "../types/room";
import SideBar from  "../components/Admin/SideBar"
import ContactsView from "../views/admin/ContactView";
import RoomsView from "../views/admin/RoomsView"
import ProceduresView from "../views/admin/ProceduresView"
import { NavKey } from "../types/navigation";
import { fetchRooms, fetchContacts, fetchProcedures } from "../api/client";
import { EscalationProcedure } from "../types/escalation";


export function AdminPage() {
  const [active, setActive] = useState<NavKey>("contacts");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [procedures, setProcedures] = useState<EscalationProcedure[]>([]);
  
 
  useEffect(() => {
    fetchRooms().then(setRooms).catch(console.error);
    fetchContacts().then(setContacts).catch(console.error);
    fetchProcedures().then(setProcedures).catch(console.error);
  }, []);

  return (
    <div className="flex h-[720px] bg-slate-50 font-sans rounded-xl overflow-hidden border border-slate-200">
      <SideBar active={active} onNavigate={setActive} />
      <main className="flex-1 overflow-y-auto p-8">
        {active === "contacts" && <ContactsView contacts={contacts} setContacts={setContacts} />}
        {active === "rooms" && <RoomsView rooms={rooms} setRooms={setRooms} />}
        {active === "procedures" && <ProceduresView procedures={procedures} setProcedures={setProcedures} contacts={contacts} />}
      </main>
    </div>
  );
}
