import { useRef, useState } from "react";
import { Plus,  Pencil, Trash2, X,  Building2
} from "lucide-react";
import { Contact, ContactCategory, ContactDraft, PhoneLine } from "../../types/contact";
import { CONTACT_CATEGORIES, CATEGORY_LABELS} from "../../constants/contact_const"
import PageHeader from "../../components/Admin/PageHeader"
import PrimaryButton from "../../components/Admin/PrimaryButton";
import SearchBar from "../../components/Admin/SearchBar";
import  {Field, inputCls} from "../../components/Admin/Field";
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
    try{
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
  }catch (error) {
    console.error("Error saving the contact:", error);
    alert("There was an error saving the contact on the server.");
  }
  }
  async function remove(id: string) { 
      try {
      await deleteContact(id);
      setContacts(contacts.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error saving the contact:", error);
      alert("There was an error saving the contact on the server.");
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
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                      <Building2 size={15} />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{c.organizationName}</div>
                      {c.accountNumber && <div className="text-xs text-slate-400">Account: {c.accountNumber}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
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
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(c)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(c.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
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
          <div className="grid grid-cols-2 gap-4">
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
              <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                <input className={inputCls} placeholder="Purpose (e.g., after_hours)" value={p.purpose} onChange={(e) => updatePhoneLine(idx, "purpose", e.target.value)} />
                <input className={inputCls} placeholder="Phone Number" value={p.phoneNumber} onChange={(e) => updatePhoneLine(idx, "phoneNumber", e.target.value)} />
                <input className={inputCls} placeholder="Contact Person (optional)" value={p.contactPersonName ?? ""} onChange={(e) => updatePhoneLine(idx, "contactPersonName", e.target.value)} />
                {editing.phoneLines.length > 1 && (
                  <button onClick={() => removePhoneLine(idx)} className="text-slate-300 hover:text-rose-500">
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