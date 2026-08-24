import { useState, useEffect } from "react";
import api from "@/services/api";
import { cn } from "@/lib/utils";
import {
  FileText,
  Mail,
  MessageSquare,
  Bell,
  Plus,
  Edit3,
  Trash2,
  Copy,
  X,
  Save,
  Eye,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from "lucide-react";

const TEMPLATE_CATEGORIES = {
  Admission: [
    { key: "welcome", label: "Welcome" },
    { key: "application_received", label: "Application Received" },
    { key: "admission_confirmed", label: "Admission Confirmed" },
    { key: "rejection", label: "Rejection" },
  ],
  Fee: [
    { key: "payment_reminder", label: "Payment Reminder" },
    { key: "payment_received", label: "Payment Received" },
    { key: "overdue_alert", label: "Overdue Alert" },
    { key: "receipt", label: "Receipt" },
  ],
  Academic: [
    { key: "exam_schedule", label: "Exam Schedule" },
    { key: "results_published", label: "Results Published" },
    { key: "assignment_due", label: "Assignment Due" },
  ],
  General: [
    { key: "holiday_announcement", label: "Holiday Announcement" },
    { key: "event_reminder", label: "Event Reminder" },
    { key: "newsletter", label: "Newsletter" },
  ],
};

const VARIABLE_PLACEHOLDERS = [
  { name: "studentName", description: "Student's full name" },
  { name: "studentId", description: "Student's roll number/ID" },
  { name: "feeAmount", description: "Fee amount due/paid" },
  { name: "dueDate", description: "Payment due date" },
  { name: "paymentDate", description: "Date of payment" },
  { name: "receiptNumber", description: "Receipt reference number" },
  { name: "examDate", description: "Scheduled exam date" },
  { name: "resultDate", description: "Results publish date" },
  { name: "assignmentTitle", description: "Assignment name" },
  { name: "className", description: "Class/section name" },
  { name: "parentName", description: "Parent/Guardian name" },
  { name: "schoolName", description: "Institution name" },
  { name: "holidayDate", description: "Holiday date" },
  { name: "holidayReason", description: "Reason for holiday" },
  { name: "eventName", description: "Event title/name" },
  { name: "eventVenue", description: "Event location/venue" },
  { name: "eventDate", description: "Event date" },
];

interface Template {
  id: string;
  name: string;
  type: "email" | "sms" | "push";
  category: string;
  subject: string;
  body: string;
  active: boolean;
  updatedAt: string;
}

interface TemplateForm {
  name: string;
  type: "email" | "sms" | "push";
  category: string;
  subject: string;
  body: string;
}

const emptyForm: TemplateForm = {
  name: "",
  type: "email",
  category: "Admission",
  subject: "",
  body: "",
};

const typeIcons: Record<string, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  push: Bell,
};

const typeLabels: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  push: "Push Notification",
};

function replacePlaceholders(text: string): string {
  return text
    .replace(/\{\{studentName\}\}/g, "Rahul Sharma")
    .replace(/\{\{studentId\}\}/g, "STU-2025-0412")
    .replace(/\{\{feeAmount\}\}/g, "₹12,500")
    .replace(/\{\{dueDate\}\}/g, "15 Feb 2026")
    .replace(/\{\{paymentDate\}\}/g, "10 Feb 2026")
    .replace(/\{\{receiptNumber\}\}/g, "RCT-89042")
    .replace(/\{\{examDate\}\}/g, "20 Mar 2026")
    .replace(/\{\{resultDate\}\}/g, "15 Apr 2026")
    .replace(/\{\{assignmentTitle\}\}/g, "Math Assignment Ch.5")
    .replace(/\{\{className\}\}/g, "Class 10 - Section A")
    .replace(/\{\{parentName\}\}/g, "Mr. Suresh Sharma")
    .replace(/\{\{schoolName\}\}/g, "Springfield International")
    .replace(/\{\{holidayDate\}\}/g, "26 Jan 2026")
    .replace(/\{\{holidayReason\}\}/g, "Republic Day")
    .replace(/\{\{eventName\}\}/g, "Annual Day Celebration")
    .replace(/\{\{eventVenue\}\}/g, "Main Auditorium")
    .replace(/\{\{eventDate\}\}/g, "5 Mar 2026")
    .replace(/\{\{[^}]+\}\}/g, "[placeholder]");
}

export default function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get("/templates");
      setTemplates(res.data.items || res.data || []);
    } catch {
      console.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filtered = templates.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });

  const openCreate = (category?: string) => {
    setEditingId(null);
    setForm({ ...emptyForm, category: category || "Admission" });
    setShowModal(true);
  };

  const openEdit = (template: Template) => {
    setEditingId(template.id);
    setForm({
      name: template.name,
      type: template.type,
      category: template.category,
      subject: template.subject,
      body: template.body,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.body.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/templates/${editingId}`, form);
      } else {
        await api.post("/templates", form);
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
      await fetchTemplates();
    } catch {
      console.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await api.delete(`/templates/${id}`);
      await fetchTemplates();
    } catch {
      console.error("Failed to delete template");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.post(`/templates/${id}/toggle`);
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
      );
    } catch {
      console.error("Failed to toggle template");
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      await api.post("/templates", {
        name: `${template.name} (Copy)`,
        type: template.type,
        category: template.category,
        subject: template.subject,
        body: template.body,
      });
      await fetchTemplates();
    } catch {
      console.error("Failed to duplicate template");
    }
  };

  const insertVariable = (variable: string) => {
    setForm((prev) => ({
      ...prev,
      body: prev.body + `{{${variable}}}`,
    }));
  };

  const categories = Object.keys(TEMPLATE_CATEGORIES);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Template Manager
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage email, SMS, and push notification templates
            </p>
          </div>
          <button
            onClick={() => openCreate()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={fetchTemplates}
            className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">
            Loading templates...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No templates found</p>
            <button
              onClick={() => openCreate()}
              className="mt-3 text-indigo-600 text-sm hover:underline"
            >
              Create your first template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((template) => {
              const Icon = typeIcons[template.type] || FileText;
              return (
                <div
                  key={template.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          template.type === "email" && "bg-blue-50 text-blue-600",
                          template.type === "sms" &&
                            "bg-green-50 text-green-600",
                          template.type === "push" &&
                            "bg-amber-50 text-amber-600"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          {template.name}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {typeLabels[template.type]}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(template.id)}
                      className="flex-shrink-0"
                    >
                      {template.active ? (
                        <ToggleRight className="h-6 w-6 text-indigo-600" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-300" />
                      )}
                    </button>
                  </div>

                  <div className="mb-3">
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                        template.active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {template.active ? "Active" : "Inactive"}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      {template.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                    {template.body || "No content yet"}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      Updated{" "}
                      {template.updatedAt
                        ? new Date(template.updatedAt).toLocaleDateString()
                        : "—"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(template)}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                        title="Edit"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(template)}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 transition"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Template" : "New Template"}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowVariables((v) => !v)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition",
                    showVariables
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  Variables
                </button>
                <button
                  onClick={() => setShowPreview((v) => !v)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition",
                    showPreview
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setShowPreview(false);
                    setShowVariables(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Fee Payment Reminder"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <div className="flex gap-2">
                      {(["email", "sms", "push"] as const).map((t) => {
                        const Icon = typeIcons[t];
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({ ...prev, type: t }))
                            }
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition",
                              form.type === t
                                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {typeLabels[t]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {form.type === "email" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      placeholder="e.g. Fee Payment Reminder for {{studentName}}"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Body
                  </label>
                  <textarea
                    value={form.body}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, body: e.target.value }))
                    }
                    placeholder="Dear {{parentName}},&#10;&#10;This is a reminder that the fee of {{feeAmount}} for {{studentName}} ({{studentId}}) is due on {{dueDate}}."
                    rows={10}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Use {"{{variableName}}"} for dynamic content
                  </p>
                </div>
              </div>

              {showVariables && (
                <div className="w-64 border-l border-gray-200 overflow-y-auto bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Available Variables
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Click to insert into body
                  </p>
                  <div className="space-y-1.5">
                    {VARIABLE_PLACEHOLDERS.map((v) => (
                      <button
                        key={v.name}
                        onClick={() => insertVariable(v.name)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition group"
                      >
                        <span className="text-xs font-mono text-indigo-600 group-hover:text-indigo-700">
                          {`{{${v.name}}}`}
                        </span>
                        <span className="block text-[11px] text-gray-400">
                          {v.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showPreview && (
                <div className="w-80 border-l border-gray-200 overflow-y-auto bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Preview
                  </h4>
                  <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm">
                    {form.type === "email" && (
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        <span className="text-xs text-gray-400">Subject:</span>
                        <p className="text-gray-900 mt-0.5">
                          {form.subject
                            ? replacePlaceholders(form.subject)
                            : "No subject"}
                        </p>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-gray-700 text-xs leading-relaxed">
                      {form.body
                        ? replacePlaceholders(form.body)
                        : "Start typing to see preview..."}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowPreview(false);
                  setShowVariables(false);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.body.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Template"
                    : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
