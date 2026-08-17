import { useRef, useState } from "react";
import Papa, { ParseResult } from "papaparse";
import {Plus, Pencil, Trash2, Upload} from "lucide-react";
import { Room, RoomDraft } from "../../types/room";
import {CSV_TEMPLATE_HEADER, initialRooms} from "../../constants/rooms_const"
import PageHeader from "../../components/Admin/PageHeader"
import PrimaryButton from "../../components/Admin/PrimaryButton";
import SearchBar from "../../components/Admin/SearchBar";
import Modal from "../../components/Admin/Modal";
import  {Field, inputCls} from "../../components/Admin/Field";
import { classNames } from "../../components/Admin/Field";
import { importRoomsCsv, createRoom, updateRoom, deleteRoom } from "../../api/client";


function boolLabel(v: boolean) { return v ? "Sí" : "No"; }

function blankRoom(): RoomDraft {
  return {
    id: null, roomNumber: "", floor: 1, roomTypeCode: "",
    bedConfiguration: { bedCount: 2, bedType: "queen" }, showerType: "walk_in_shower",
    bedClearance: "flush_to_floor", isAccessible: false, hasKitchen: false,
    hasPullOutSofaBed: false, hasSofa: false, hasCarpet: false,
    view: "street_facing", curtainType: "manual", roomClass: "regular",
  };
}

function RoomsView({ rooms, setRooms }: { rooms: Room[]; setRooms: (r: Room[]) => void }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<RoomDraft | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = rooms.filter((r) => r.roomNumber.includes(query) || (r.roomTypeCode || "").toLowerCase().includes(query.toLowerCase()));

  function openNew() { setEditing(blankRoom()); setShowModal(true); }
  function openEdit(r: Room) { setEditing(JSON.parse(JSON.stringify(r))); setShowModal(true); }
  async function save() {
    if (!editing) return;
    try{
      if (editing.id){
        const { id, ...patch } = editing;
        const updated = await updateRoom(id, patch);
        setRooms(rooms.map((r) => (r.id === editing.id ? (editing as Room) : r)));
      }else{
        const { id, ...newRoom } = editing;
        const created = await createRoom(newRoom);
        setRooms([...rooms, created]);
    }
    setShowModal(false);
      
    }
    catch (error) {
      console.error("Error al guardar la habitación:", error);
      alert("Hubo un error guardando la habitación en el servidor.");
    }
  }
  async function remove(id: string) { 
      try {
      await deleteRoom(id);
      setRooms(rooms.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error al eliminar la habitación:", error);
      alert("Hubo un error eliminando la habitación en el servidor.");
    }
   }

  function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: ParseResult<Record<string, string>>) => {
        const toBool = (v: string) => String(v).trim().toLowerCase() === "true" || v === "1";
        const parsed: Omit<Room, "id">[] = results.data.map((row) => ({
          roomNumber: row.roomNumber || "",
          floor: Number(row.floor) || 1,
          roomTypeCode: row.roomTypeCode || "",
          bedConfiguration: { bedCount: Number(row.bedCount) || 1, bedType: (row.bedType as "queen" | "king") || "queen" },
          showerType: (row.showerType as Room["showerType"]) || "bathtub",
          bedClearance: (row.bedClearance as Room["bedClearance"]) || "flush_to_floor",
          isAccessible: toBool(row.isAccessible),
          hasKitchen: toBool(row.hasKitchen),
          hasPullOutSofaBed: toBool(row.hasPullOutSofaBed),
          hasSofa: toBool(row.hasSofa),
          hasCarpet: toBool(row.hasCarpet),
          view: (row.view as Room["view"]) || "street_facing",
          curtainType: (row.curtainType as Room["curtainType"]) || "manual",
          roomClass: (row.roomClass as Room["roomClass"]) || "regular",
        }));
        try{
          const created = await importRoomsCsv(parsed);
          setRooms([...rooms, ...created]);
          setShowImport(false);
        } catch (error) {
          console.error("Error al importar habitaciones:", error);
          alert("Hubo un error guardando las habitaciones en el servidor.");
        }
        
      },
    });
  }

  return (
    <>
      <PageHeader
        title="Habitaciones"
        subtitle={`${rooms.length} de 89 habitaciones cargadas`}
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Upload size={15} /> Importar CSV
            </button>
            <PrimaryButton icon={Plus} onClick={openNew}>Nueva habitación</PrimaryButton>
          </div>
        }
      />
      <div className="mb-4 max-w-sm">
        <SearchBar value={query} onChange={setQuery} placeholder="Buscar por número o código de tipo..." />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Habitación</th>
              <th className="text-left px-5 py-3 font-medium">Camas</th>
              <th className="text-left px-5 py-3 font-medium">Baño</th>
              <th className="text-left px-5 py-3 font-medium">Vista</th>
              <th className="text-left px-5 py-3 font-medium">Accesible</th>
              <th className="text-left px-5 py-3 font-medium">Clase</th>
              <th className="text-right px-5 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-800">#{r.roomNumber}</div>
                  <div className="text-xs text-slate-400">{r.roomTypeCode || "sin código"} · piso {r.floor}</div>
                </td>
                <td className="px-5 py-4 text-slate-600">{r.bedConfiguration.bedCount} {r.bedConfiguration.bedType === "queen" ? "queen" : "king"}</td>
                <td className="px-5 py-4 text-slate-600">{r.showerType === "walk_in_shower" ? "Ducha" : r.showerType === "bathtub" ? "Tina" : "Combo"}</td>
                <td className="px-5 py-4 text-slate-600">{r.view === "street_facing" ? "Calle" : "Parqueadero"}</td>
                <td className="px-5 py-4">
                  <span className={classNames("text-xs px-2 py-1 rounded-full", r.isAccessible ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                    {boolLabel(r.isAccessible)}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600 capitalize">{r.roomClass === "suite" ? "Suite" : "Regular"}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(r)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(r.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showImport && (
        <Modal title="Importar habitaciones desde CSV" onClose={() => setShowImport(false)}>
          <p className="text-sm text-slate-500 mb-3">El archivo debe tener estas columnas exactas:</p>
          <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-500 font-mono mb-4 overflow-x-auto whitespace-nowrap">
            {CSV_TEMPLATE_HEADER}
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCsvFile} className="text-sm text-slate-600" />
        </Modal>
      )}

      {showModal && editing && (
        <Modal title={editing.id ? "Editar habitación" : "Nueva habitación"} onClose={() => setShowModal(false)} wide>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Número de habitación">
              <input className={inputCls} value={editing.roomNumber} onChange={(e) => setEditing({ ...editing, roomNumber: e.target.value })} />
            </Field>
            <Field label="Piso">
              <input type="number" className={inputCls} value={editing.floor} onChange={(e) => setEditing({ ...editing, floor: Number(e.target.value) })} />
            </Field>
            <Field label="Código de tipo (opcional)">
              <input className={inputCls} value={editing.roomTypeCode ?? ""} onChange={(e) => setEditing({ ...editing, roomTypeCode: e.target.value })} placeholder="PNK1" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Cantidad de camas">
              <input type="number" className={inputCls} value={editing.bedConfiguration.bedCount} onChange={(e) => setEditing({ ...editing, bedConfiguration: { ...editing.bedConfiguration, bedCount: Number(e.target.value) } })} />
            </Field>
            <Field label="Tipo de cama">
              <select className={inputCls} value={editing.bedConfiguration.bedType} onChange={(e) => setEditing({ ...editing, bedConfiguration: { ...editing.bedConfiguration, bedType: e.target.value as "queen" | "king" } })}>
                <option value="queen">Queen</option>
                <option value="king">King</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Baño">
              <select className={inputCls} value={editing.showerType} onChange={(e) => setEditing({ ...editing, showerType: e.target.value as Room["showerType"] })}>
                <option value="walk_in_shower">Ducha (walk-in)</option>
                <option value="bathtub">Tina</option>
                <option value="tub_shower_combo">Combo tina/ducha</option>
              </select>
            </Field>
            <Field label="Espacio bajo la cama">
              <select className={inputCls} value={editing.bedClearance} onChange={(e) => setEditing({ ...editing, bedClearance: e.target.value as Room["bedClearance"] })}>
                <option value="flush_to_floor">Al ras del piso</option>
                <option value="gap_underneath">Con espacio debajo</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Vista">
              <select className={inputCls} value={editing.view} onChange={(e) => setEditing({ ...editing, view: e.target.value as Room["view"] })}>
                <option value="street_facing">Hacia la calle</option>
                <option value="parking_lot_facing">Hacia el parqueadero</option>
              </select>
            </Field>
            <Field label="Cortinas">
              <select className={inputCls} value={editing.curtainType} onChange={(e) => setEditing({ ...editing, curtainType: e.target.value as Room["curtainType"] })}>
                <option value="manual">Manuales</option>
                <option value="electric">Eléctricas</option>
              </select>
            </Field>
          </div>

          <Field label="Clase de habitación">
            <select className={inputCls} value={editing.roomClass} onChange={(e) => setEditing({ ...editing, roomClass: e.target.value as Room["roomClass"] })}>
              <option value="regular">Regular</option>
              <option value="suite">Suite</option>
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
            {([
              ["isAccessible", "Habitación accesible"],
              ["hasKitchen", "Tiene cocina"],
              ["hasPullOutSofaBed", "Sofá cama"],
              ["hasSofa", "Sofá pequeño"],
              ["hasCarpet", "Alfombra"],
            ] as [keyof RoomDraft, string][]).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-slate-600 py-1.5">
                <input
                  type="checkbox"
                  checked={Boolean(editing[key])}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.checked })}
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-400"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
            <PrimaryButton onClick={save}>Guardar habitación</PrimaryButton>
          </div>
        </Modal>
      )}
    </>
  );
}
export default RoomsView;