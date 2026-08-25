import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { Contact } from "../../types/contact";
import { EscalationProcedure, EscalationProcedureDraft, EscalationStep } from "../../types/escalation";
import PageHeader from "../../components/Admin/PageHeader";
import PrimaryButton from "../../components/Admin/PrimaryButton";
import SearchBar from "../../components/Admin/SearchBar";
import Modal from "../../components/Admin/Modal";
import { Field, inputCls } from "../../components/Admin/Field";
import { createProcedure, updateProcedure, deleteProcedure } from "../../api/client";

const CATEGORY_SUGGESTIONS = [
  "front_desk_policy", "maintenance_howto", "shift_training",
  "vip_guest_info", "third_party_escalation", "front_desk_operations",
];

function blankProcedure(): EscalationProcedureDraft {
  return { id: null, triggerSituation: "", content: "", category: "front_desk_operations", steps: [] };
}

export default function ProceduresView({ procedures, setProcedures, contacts }: {
  procedures: EscalationProcedure[]; setProcedures: (p: EscalationProcedure[]) => void; contacts: Contact[];
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<EscalationProcedureDraft | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const filtered = procedures.filter((p) =>
    p.triggerSituation.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  function openNew() { setEditing(blankProcedure()); setShowSteps(false); setShowModal(true); }
  function openEdit(p: EscalationProcedure) {
    const draft = JSON.parse(JSON.stringify(p));
    setEditing(draft);
    setShowSteps(Boolean(p.steps && p.steps.length > 0));
    setShowModal(true);
  }

  async function save() {
    if (!editing) return;
    const { id, ...patch } = { ...editing, steps: showSteps ? editing.steps : [] };

    try {
      if (id) {
        const updated = await updateProcedure(id, patch);
        setProcedures(procedures.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createProcedure(patch);
        setProcedures([...procedures, created]);
      }
      setShowModal(false);
      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "The procedure was saved successfully.",
        confirmButtonColor: "#7c3aed",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "There was an error saving the procedure.",
        confirmButtonColor: "#7c3aed",
      });
    }
  }

  async function remove(p: EscalationProcedure) {
    const result = await Swal.fire({
      title: "Delete Procedure?",
      text: `Are you sure you want to delete "${p.triggerSituation}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProcedure(p.id);
      setProcedures(procedures.filter((item) => item.id !== p.id));
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The procedure has been removed.",
        confirmButtonColor: "#7c3aed",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error deleting the procedure.",
        confirmButtonColor: "#7c3aed",
      });
    }
  }

  function addStep() {
    if (!editing) return;
    const steps = editing.steps ?? [];
    setEditing({ ...editing, steps: [...steps, { order: steps.length + 1, condition: "", contactId: "", instructions: "", isEmergency: false }] });
  }
  function updateStep(idx: number, field: keyof EscalationStep, value: any) {
    if (!editing?.steps) return;
    const steps = [...editing.steps];
    steps[idx] = { ...steps[idx], [field]: value };
    setEditing({ ...editing, steps });
  }
  function removeStep(idx: number) {
    if (!editing?.steps) return;
    setEditing({ ...editing, steps: editing.steps.filter((_, i) => i !== idx) });
  }

  return (
    <>
      <PageHeader 
        title="Procedures" 
        subtitle={`${procedures.length} procedures loaded`}
        action={<PrimaryButton icon={Plus} onClick={openNew}>New Procedure</PrimaryButton>} 
      />
      
      <div className="mb-4 max-w-sm">
        <SearchBar value={query} onChange={setQuery} placeholder="Search situation or category..." />
      </div>

      {/* MOBILE LIST VIEW (Shown on small screens) */}
      <div className="block md:hidden space-y-3">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-slate-800 break-all text-sm">
                {p.triggerSituation}
                {p.steps?.some((s) => s.isEmergency) && (
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-normal">
                    emergency
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(p)} className="p-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg">
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(p)} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="text-xs">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{p.category}</span>
            </div>

            <p className="text-xs text-slate-500 line-clamp-2 pt-1">{p.content}</p>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE VIEW (Shown on md screens and larger) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Situation</th>
              <th className="text-left px-5 py-3 font-medium">Category</th>
              <th className="text-left px-5 py-3 font-medium">Content</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-5 py-4 font-medium text-slate-800 max-w-[200px] break-all">
                  {p.triggerSituation}
                  {p.steps?.some((s) => s.isEmergency) && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-normal">
                      emergency
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{p.category}</span>
                </td>
                <td className="px-5 py-4 text-slate-500 max-w-xs truncate">{p.content}</td>
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(p)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && editing && (
        <Modal title={editing.id ? "Edit Procedure" : "New Procedure"} onClose={() => setShowModal(false)} wide>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Situation Name (short title)">
              <input className={inputCls} value={editing.triggerSituation} onChange={(e) => setEditing({ ...editing, triggerSituation: e.target.value })} placeholder="late_checkout_policy" />
            </Field>
            <Field label="Category">
              <input className={inputCls} value={editing.category} list="category-suggestions" onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              <datalist id="category-suggestions">
                {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
              </datalist>
            </Field>
          </div>

          <Field label="Procedure Content (this is embedded for semantic search and is the only thing the chat uses to respond)">
            <textarea className={inputCls} rows={6} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} placeholder="Paste the complete procedure text here." />
          </Field>

          <label className="flex items-center gap-2 text-sm text-slate-600 mb-3">
            <input type="checkbox" checked={showSteps} onChange={(e) => setShowSteps(e.target.checked)} className="rounded border-slate-300 text-violet-600" />
            This procedure needs steps with contact calls (e.g., elevator, fire)
          </label>

          {showSteps && (
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="block text-xs font-medium text-slate-500">Steps</span>
                <button onClick={addStep} className="text-xs text-violet-600 font-medium flex items-center gap-1"><Plus size={13} /> Add Step</button>
              </div>
              {(editing.steps ?? []).map((s, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <input className={inputCls} placeholder="Condition (optional)" value={s.condition ?? ""} onChange={(e) => updateStep(idx, "condition", e.target.value)} />
                  <select className={inputCls} value={s.contactId ?? ""} onChange={(e) => updateStep(idx, "contactId", e.target.value)}>
                    <option value="">No Contact (just instructions)</option>
                    {contacts.map((c) => <option key={c.id} value={c.id}>{c.organizationName}</option>)}
                  </select>
                  <input className={inputCls} placeholder="Instructions" value={s.instructions} onChange={(e) => updateStep(idx, "instructions", e.target.value)} />
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={s.isEmergency} onChange={(e) => updateStep(idx, "isEmergency", e.target.checked)} className="rounded border-slate-300 text-rose-600" />
                    It's an emergency step
                  </label>
                  <button onClick={() => removeStep(idx)} className="text-xs text-rose-500 font-medium">Remove Step</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <PrimaryButton onClick={save}>Save procedure</PrimaryButton>
          </div>
        </Modal>
      )}
    </>
  );
}