import { useRef, useState } from "react";
import Papa, { ParseResult } from "papaparse";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Room, RoomDraft, ChairType } from "../../types/room";
import { CSV_TEMPLATE_HEADER } from "../../constants/rooms_const";
import PageHeader from "../../components/Admin/PageHeader";
import PrimaryButton from "../../components/Admin/PrimaryButton";
import SearchBar from "../../components/Admin/SearchBar";
import Modal from "../../components/Admin/Modal";
import { Field, inputCls } from "../../components/Admin/Field";
import { classNames } from "../../components/Admin/Field";
import { importRoomsCsv, createRoom, updateRoom, deleteRoom } from "../../api/client";

const parseConnectingRoom = (val: any): string | undefined => {
  if (!val) return undefined;
  const str = String(val).trim().toUpperCase();
  if (["NONE", "NO", "FALSE", "-", "N/A"].includes(str)) return undefined;
  return str;
};


function boolLabel(v: boolean) { return v ? "Yes" : "No"; }

function blankRoom(): RoomDraft {
  return {
    id: null, roomNumber: "", floor: 1, roomTypeCode: "",
    bedConfiguration: { bedCount: 2, bedType: "queen" }, showerType: "walk_in_shower",
    bedClearance: "flush_to_floor", isAccessible: false, hasKitchen: false,
    hasPullOutSofaBed: false, chairType: "none", hasCarpet: false,
    view: "street_facing", roomClass: "regular",
    connectingRoomNumber: undefined, hasConnectingRoom: undefined,
  };
}

function RoomsView({ rooms, setRooms }: { rooms: Room[]; setRooms: (r: Room[]) => void }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<RoomDraft | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Filters search results AND sorts them numerically (101, 102, 103...)
  const sortedAndFilteredRooms = rooms
    .filter((r) => {
      const q = query.toLowerCase();
      return (
        r.roomNumber.toLowerCase().includes(q) ||
        (r.roomTypeCode || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) =>
      a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
    );

  function openNew() { setEditing(blankRoom()); setShowModal(true); }
  function openEdit(r: Room) { setEditing(JSON.parse(JSON.stringify(r))); setShowModal(true); }

  async function save() {
    if (!editing) return;
    try {
      if (editing.id) {
        const { id, ...patch } = editing;
        await updateRoom(id, patch);
        setRooms(rooms.map((r) => (r.id === editing.id ? (editing as Room) : r)));
      } else {
        const { id, ...newRoom } = editing;
        const created = await createRoom(newRoom);
        setRooms([...rooms, created]);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error saving the room:", error);
      alert("There was an error saving the room to the server.");
    }
  }

  async function remove(id: string) {
    try {
      await deleteRoom(id);
      setRooms(rooms.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting the room:", error);
      alert("There was an error deleting the room from the server.");
    }
  }

  function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: ParseResult<Record<string, string>>) => {
        const toBool = (v: string) => {
          const str = String(v).trim().toLowerCase();
          return str === "true" || str === "yes" || str === "1";
        };

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
          chairType: (row.chairType as Room["chairType"]) || "none",
          hasCarpet: toBool(row.hasCarpet),
          view: (row.view as Room["view"]) || "street_facing",
          roomClass: (row.roomClass as Room["roomClass"]) || "regular",
          connectingRoomNumber: row.connectingRoomNumber || undefined,
          hasConnectingRoom: toBool(row.hasConnectingRoom),
        }));

        try {
          const created = await importRoomsCsv(parsed);
          setRooms([...rooms, ...created]);
          setShowImport(false);
        } catch (error) {
          console.error("Error importing rooms:", error);
          alert("There was an error saving the rooms to the server.");
        }
      },
    });
  }

  return (
    <>
      <PageHeader
        title="Rooms"
        subtitle={`${rooms.length} of 89 rooms loaded`}
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Upload size={15} /> Import CSV
            </button>
            <PrimaryButton icon={Plus} onClick={openNew}>New Room</PrimaryButton>
          </div>
        }
      />
      <div className="mb-4 max-w-sm">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by number or type code..." />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Room</th>
              <th className="text-left px-5 py-3 font-medium">Beds</th>
              <th className="text-left px-5 py-3 font-medium">Bathroom</th>
              <th className="text-left px-5 py-3 font-medium">View</th>
              <th className="text-left px-5 py-3 font-medium">Accessible</th>
              <th className="text-left px-5 py-3 font-medium">Class</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredRooms.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-800">#{r.roomNumber}</div>
                  <div className="text-xs text-slate-400">
                    {r.roomTypeCode || "no code"} · floor {r.floor}
                    {r.connectingRoomNumber && ` · connects to #${r.connectingRoomNumber}`}
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">{r.bedConfiguration.bedCount} {r.bedConfiguration.bedType === "queen" ? "queen" : "king"}</td>
                <td className="px-5 py-4 text-slate-600">{r.showerType === "walk_in_shower" ? "Shower" : r.showerType === "bathtub" ? "Tub" : "Combo"}</td>
                <td className="px-5 py-4 text-slate-600">{r.view === "street_facing" ? "Street Facing" : "Parking Lot"}</td>
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
        <Modal title="Import Rooms from CSV" onClose={() => setShowImport(false)}>
          <p className="text-sm text-slate-500 mb-3">The file must contain exactly these columns:</p>
          <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-500 font-mono mb-4 overflow-x-auto whitespace-nowrap">
            {CSV_TEMPLATE_HEADER}
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCsvFile} className="text-sm text-slate-600" />
        </Modal>
      )}

      {showModal && editing && (
        <Modal title={editing.id ? "Edit Room" : "New Room"} onClose={() => setShowModal(false)} wide>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Room Number">
              <input className={inputCls} value={editing.roomNumber} onChange={(e) => setEditing({ ...editing, roomNumber: e.target.value })} />
            </Field>
            <Field label="Floor">
              <input type="number" className={inputCls} value={editing.floor} onChange={(e) => setEditing({ ...editing, floor: Number(e.target.value) })} />
            </Field>
            <Field label="Type Code (optional)">
              <input className={inputCls} value={editing.roomTypeCode ?? ""} onChange={(e) => setEditing({ ...editing, roomTypeCode: e.target.value })} placeholder="PNK1" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Bed Count">
              <input type="number" className={inputCls} value={editing.bedConfiguration.bedCount} onChange={(e) => setEditing({ ...editing, bedConfiguration: { ...editing.bedConfiguration, bedCount: Number(e.target.value) } })} />
            </Field>
            <Field label="Bed Type">
              <select className={inputCls} value={editing.bedConfiguration.bedType} onChange={(e) => setEditing({ ...editing, bedConfiguration: { ...editing.bedConfiguration, bedType: e.target.value as "queen" | "king" } })}>
                <option value="queen">Queen</option>
                <option value="king">King</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Bathroom">
              <select className={inputCls} value={editing.showerType} onChange={(e) => setEditing({ ...editing, showerType: e.target.value as Room["showerType"] })}>
                <option value="walk_in_shower">Shower (walk-in)</option>
                <option value="bathtub">Tub</option>
                <option value="tub_shower_combo">Combo tub/shower</option>
              </select>
            </Field>
            <Field label="Space Under Bed">
              <select className={inputCls} value={editing.bedClearance} onChange={(e) => setEditing({ ...editing, bedClearance: e.target.value as Room["bedClearance"] })}>
                <option value="flush_to_floor">Flush to Floor</option>
                <option value="gap_underneath">Gap Underneath</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="View">
              <select className={inputCls} value={editing.view} onChange={(e) => setEditing({ ...editing, view: e.target.value as Room["view"] })}>
                <option value="street_facing">Towards the street</option>
                <option value="parking_lot_facing">Towards the parking lot</option>
              </select>
            </Field>
            <Field label="Seating / Chair Type">
              <select
                className={inputCls}
                value={editing.chairType}
                onChange={(e) => setEditing({ ...editing, chairType: e.target.value as ChairType })}
              >
                <option value="none">None</option>
                <option value="chair">Armchair</option>
                <option value="sofa">Mini Sofa</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Room Class">
              <select className={inputCls} value={editing.roomClass} onChange={(e) => setEditing({ ...editing, roomClass: e.target.value as Room["roomClass"] })}>
                <option value="regular">Regular</option>
                <option value="suite">Suite</option>
              </select>
            </Field>
            <Field label="Connecting Room (optional)">
              <input
                className={inputCls}
                value={editing.connectingRoomNumber ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, connectingRoomNumber: e.target.value || undefined })
                }
                placeholder="e.g. 228 (leave empty if none)"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
            {([
              ["isAccessible", "Accessible Room"],
              ["hasKitchen", "Has Kitchen"],
              ["hasPullOutSofaBed", "Pull-out Sofa Bed"],
              ["hasCarpet", "Carpet"],
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
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <PrimaryButton onClick={save}>Save Room</PrimaryButton>
          </div>
        </Modal>
      )}
    </>
  );
}

export default RoomsView;