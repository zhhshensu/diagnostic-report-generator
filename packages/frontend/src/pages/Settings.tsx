import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProviderStore } from "@/stores/provider-store";
import { useReportStore } from "@/stores/report-store";
import { useUIStore } from "@/stores/ui-store";
import { useT } from "@/lib/i18n/store";
import { getStorageStats, clearAllData } from "@/lib/db";
import ProviderCard from "@/components/ProviderCard";
import ProviderForm from "@/components/ProviderForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Server,
  Trash2,
  AlertTriangle,
  Database,
  Plus,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "providers" | "cache";

export default function Settings() {
  const navigate = useNavigate();
  const t = useT();
  const { addToast } = useUIStore();
  const { providers } = useProviderStore();
  const { reports, clearAll: clearReports } = useReportStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("providers");
  const [stats, setStats] = useState({ reportCount: 0, providerCount: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmClearReports, setConfirmClearReports] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    getStorageStats().then(setStats);
  }, [providers.length, reports.length]);

  const editProvider = editingId
    ? providers.find((p) => p.id === editingId)
    : undefined;

  const handleClearReports = () => {
    clearReports();
    setStats((s) => ({ ...s, reportCount: 0 }));
    addToast(t("settings.cacheCleared"), "success");
    setConfirmClearReports(false);
  };

  const handleClearAll = async () => {
    clearReports();
    await clearAllData();
    setStats({ reportCount: 0, providerCount: 0 });
    addToast(t("settings.dataReset"), "success");
    setConfirmClearAll(false);
  };

  const sidebarItems: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: "providers", label: t("settings.sidebarProviders"), icon: <Server className="w-4 h-4" /> },
    { key: "cache", label: t("settings.sidebarCache"), icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        {t("common.back")}
      </button>

      <div className="flex gap-0 items-start">
        {/* ===== Left Sidebar ===== */}
        <aside className="w-52 shrink-0">
          <div className="sticky top-20 bg-card border rounded-xl p-3">
            <h2 className="text-sm font-semibold mb-2 px-2.5 py-1.5 text-foreground/70 tracking-wide uppercase">
              {t("settings.title")}
            </h2>
            <nav className="space-y-0.5">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                    activeTab === item.key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Divider */}
        <div className="w-px bg-border mx-6 self-stretch" />

        {/* ===== Right Content ===== */}
        <div className="flex-1 min-w-0 min-h-[400px] bg-card border rounded-xl p-5">
          {activeTab === "providers" && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold">{t("settings.providers")}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {t("settings.providersDesc")}
                  </p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2 shrink-0">
                  <Plus className="w-4 h-4" /> {t("providers.add")}
                </Button>
              </div>

              {/* Provider list */}
              {providers.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-white">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
                    <Server className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-1">{t("providers.empty")}</p>
                  <p className="text-sm text-muted-foreground mb-5">
                    {t("providers.emptyDesc")}
                  </p>
                  <Button onClick={() => setShowForm(true)}>{t("providers.addFirst")}</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {providers.map((p) => (
                    <ProviderCard
                      key={p.id}
                      provider={p}
                      onEdit={() => setEditingId(p.id)}
                    />
                  ))}
                </div>
              )}

              {/* Provider form dialog */}
              <ProviderForm
                open={showForm || !!editingId}
                onOpenChange={(open) => {
                  setShowForm(open);
                  if (!open) setEditingId(null);
                }}
                editProvider={editProvider}
              />
            </div>
          )}

          {activeTab === "cache" && (
            <div>
              {/* Header */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold">{t("settings.sidebarCache")}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("settings.storageDesc")}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl border p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Database className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {t("settings.reportCount")}
                    </span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums">{stats.reportCount}</p>
                </div>
                <div className="bg-white rounded-xl border p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Server className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {t("settings.providerCount")}
                    </span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums">{stats.providerCount}</p>
                </div>
              </div>

              {/* Danger zone */}
              <div className="rounded-xl border border-red-200 overflow-hidden">
                <div className="px-5 py-3 bg-red-50/60 border-b border-red-100">
                  <h4 className="text-sm font-semibold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    危险操作
                  </h4>
                </div>

                {/* Clear reports */}
                <div className="px-5 py-4 flex items-center justify-between bg-white">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{t("settings.clearReports")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("settings.clearReportsDesc")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0 ml-4"
                    onClick={() => setConfirmClearReports(true)}
                    disabled={reports.length === 0}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> {t("common.delete")}
                  </Button>
                </div>

                {/* Divider */}
                <div className="border-t border-red-100" />

                {/* Reset all */}
                <div className="px-5 py-4 flex items-center justify-between bg-white">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-red-800">{t("settings.clearAll")}</p>
                    <p className="text-xs text-red-600/70 mt-0.5">
                      {t("settings.clearAllDesc")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-red-600 border-red-300 hover:bg-red-100 shrink-0 ml-4"
                    onClick={() => setConfirmClearAll(true)}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> {t("common.delete")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Clear Reports Dialog */}
      <Dialog open={confirmClearReports} onOpenChange={setConfirmClearReports}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-destructive" /> {t("settings.clearReports")}
            </DialogTitle>
            <DialogDescription>{t("settings.clearReportsConfirm")}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmClearReports(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleClearReports}>
              {t("common.confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Clear All Dialog */}
      <Dialog open={confirmClearAll} onOpenChange={setConfirmClearAll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" /> {t("settings.clearAll")}
            </DialogTitle>
            <DialogDescription>{t("settings.clearAllConfirm")}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmClearAll(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              {t("common.confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
