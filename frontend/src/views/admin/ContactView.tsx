import { useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, Building2 } from "lucide-react";
import Swal from "sweetalert2";
import { Contact, ContactCategory, ContactDraft, PhoneLine } from "../../types/contact";
import { CONTACT_CATEGORIES, CATEGORY_LABELS } from "../../constants/contact_const";
import PageHeader from "../../components/Admin/PageHeader";
import PrimaryButton from "../../components/Admin/PrimaryButton";
import SearchBar from "../../components/Admin/SearchBar";
import { Field, inputCls } from "../../components/Admin/Field";
import Modal from "../../components/Admin/Modal";
import { createContact, updateContact, deleteContact } from "../../api/client";

function blankContact(): ContactDraft {
  return { id: null, organizationName: "", category: "tech_support", accountNumber: "", phoneLines: [{ purpose: "", phoneNumber: "" }], notes: "" };
}

function ContactsView({ contacts, setContacts }: { contacts: Contact[]; setContacts: (c: Contact[]) => void }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ContactDraft | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = contacts.filter((c) =>
    c.organizationName.toLowerCase().includes(query.toLowerCase()) ||
    CATEGORY_LABELS[c.category]?.toLowerCase().includes(query.toLowerCase())
  );

  function openNew() { setEditing(blankContact()); setShowModal(true); }
  function openEdit(c: Contact) { setEditing(JSON.parse(JSON.stringify(c))); setShowModal(true); }

  async function save() {
    if (!editing) return;
    try {
      if (editing.id) {
        const { id, ...patch } = editing;
        const updated = await updateContact(id, patch);
        setContacts(contacts.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const { id, ...newContact } = editing;
        const created = await createContact(newContact);
        setContacts([...contacts, created]);
      }
      setShowModal(false);
      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: `Contact "${editing.organizationName}" saved successfully.`,
        confirmButtonColor: "#7c3aed",
      });
    } catch (error) {
      console.error("Error saving the contact:", error);
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "There was an error saving the contact on the server.",
        confirmButtonColor: "#7c3aed",
      });
    }
  }

  async function remove(c: Contact) {
    const result = await Swal.fire({
      title: `Delete ${c.organizationName}?`,
      text: "Are you sure you want to delete this contact? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteContact(c.id);
      setContacts(contacts.filter((item) => item.id !== c.id));
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The contact has been removed.",
        confirmButtonColor: "#7c3aed",
      });
    } catch (error) {
      console.error("Error deleting the contact:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error deleting the contact from the server.",
        confirmButtonColor: "#7c3aed",
      });
    }
  }

  function updatePhoneLine(idx: number, field: keyof PhoneLine, value: string) {
    if (!editing) return;
    const lines = [...editing.phoneLines];
    lines[idx] = { ...lines[idx], [field]: value };
    setEditing({ ...editing, phoneLines: lines });
  }
  function addPhoneLine() {
    if (!editing) return;
    setEditing({ ...editing, phoneLines: [...editing.phoneLines, { purpose: "", phoneNumber: "" }] });
  }
  function removePhoneLine(idx: number) {
    if (!editing) return;
    setEditing({ ...editing, phoneLines: editing.phoneLines.filter((_, i) => i !== idx) });
  }

  return (
    <>
      <PageHeader
        title="Contacts Directory"
        subtitle={`${contacts.length} contacts registered`}
        action={<PrimaryButton icon={Plus} onClick={openNew}>New Contact</PrimaryButton>}
      />
      <div className="mb-4 max-w-sm">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by name or category..." />
      </div>

      {/* MOBILE LIST VIEW */}
      <div className="block md:hidden space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                  <Building2 size={16} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{c.organizationName}</div>
                  {c.accountNumber && <div className="text-xs text-slate-400">Account: {c.accountNumber}</div>}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(c)} className="p-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg">
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(c)} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {CATEGORY_LABELS[c.category] || c.category}
              </span>
            </div>

            <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-lg">
              {c.phoneLines.map((p, i) => (
                <div key={i} className="text-slate-600 flex justify-between gap-2">
                  <span className="text-slate-400 capitalize">{p.purpose || "principal"}:</span>
                  <span className="font-medium">{p.phoneNumber || "—"}</span>
                </div>
              ))}
            </div>

            {c.notes && (
              <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-100">
                {c.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Organization</th>
              <th className="text-left px-5 py-3 font-medium">Category</th>
              <th className="text-left px-5 py-3 font-medium">Phone Lines</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                      <Building2 size={15} />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{c.organizationName}</div>
                      {c.accountNumber && <div className="text-xs text-slate-400">Account: {c.accountNumber}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                    {CATEGORY_LABELS[c.category] || c.category}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="space-y-0.5">
                    {c.phoneLines.slice(0, 2).map((p, i) => (
                      <div key={i} className="text-slate-600">
                        <span className="text-slate-400">{p.purpose || "principal"}:</span> {p.phoneNumber || "—"}
                      </div>
                    ))}
                    {c.phoneLines.length > 2 && (
                      <div className="text-xs text-violet-600">+{c.phoneLines.length - 2} more</div>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(c)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(c)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && editing && (
        <Modal title={editing.id ? "Edit Contact" : "New Contact"} onClose={() => setShowModal(false)} wide>
          <Field label="Organization Name">
            <input className={inputCls} value={editing.organizationName} onChange={(e) => setEditing({ ...editing, organizationName: e.target.value })} placeholder="e.g., Tech Guru" />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Category">
              <select className={inputCls} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as ContactCategory })}>
                {CONTACT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </Field>
            <Field label="Account Number (optional)">
              <input className={inputCls} value={editing.accountNumber ?? ""} onChange={(e) => setEditing({ ...editing, accountNumber: e.target.value })} placeholder="e.g., A/C 1489" />
            </Field>
          </div>

          <div className="mb-2 flex items-center justify-between mt-2">
            <span className="block text-xs font-medium text-slate-500">Phone Lines</span>
            <button onClick={addPhoneLine} className="text-xs text-violet-600 font-medium flex items-center gap-1">
              <Plus size={13} /> Add Line
            </button>
          </div>
          <div className="space-y-2 mb-4">
            {editing.phoneLines.map((p, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center border sm:border-0 border-slate-100 p-2 sm:p-0 rounded-lg">
                <input className={inputCls} placeholder="Purpose (e.g., after_hours)" value={p.purpose} onChange={(e) => updatePhoneLine(idx, "purpose", e.target.value)} />
                <input className={inputCls} placeholder="Phone Number" value={p.phoneNumber} onChange={(e) => updatePhoneLine(idx, "phoneNumber", e.target.value)} />
                <input className={inputCls} placeholder="Contact Person (optional)" value={p.contactPersonName ?? ""} onChange={(e) => updatePhoneLine(idx, "contactPersonName", e.target.value)} />
                {editing.phoneLines.length > 1 && (
                  <button onClick={() => removePhoneLine(idx)} className="text-slate-400 hover:text-rose-500 self-end sm:self-center p-1">
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Field label="Notes (optional)">
            <textarea className={inputCls} rows={2} value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} placeholder="e.g., special rules for when to use this contact" />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <PrimaryButton onClick={save}>Save Contact</PrimaryButton>
          </div>
        </Modal>
      )}
    </>
  );
}

export default ContactsView;