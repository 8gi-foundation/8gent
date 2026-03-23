'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useApp } from '@/context/AppContext';
import { useTenant } from '@/context/TenantContext';
import { Dock } from '@/components/dock/Dock';
import type { Id } from '../../../../convex/_generated/dataModel';

// ── Consent type labels ──────────────────────────────────────
const CONSENT_LABELS: Record<string, { label: string; description: string; required: boolean }> = {
  data_processing: {
    label: 'Data Processing',
    description: 'Required to use the app. Covers basic storage of cards and communication history.',
    required: true,
  },
  health_data: {
    label: 'Health & Accessibility Data',
    description: 'Required. AAC data is classified as health-related under GDPR Article 9.',
    required: true,
  },
  personalization: {
    label: 'Personalization',
    description: 'Optional. Allows the app to learn usage patterns and adapt the card layout.',
    required: false,
  },
  analytics: {
    label: 'Usage Analytics',
    description: 'Optional. Helps us improve the app by collecting anonymous usage statistics.',
    required: false,
  },
};

/**
 * Parent Admin Panel
 *
 * Manage child profile, members, usage, and quick actions.
 * Only owners see member management. Public users see read-only profile.
 */

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    owner: { bg: '#E8F5E9', text: '#2E7D32' },
    child: { bg: '#E3F2FD', text: '#1565C0' },
    visitor: { bg: '#FFF3E0', text: '#E65100' },
  };
  const c = colors[role] || { bg: '#F5F5F5', text: '#616161' };

  return (
    <span
      className="px-2 py-0.5 rounded-full text-[12px] font-semibold capitalize"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {role}
    </span>
  );
}

export default function AdminPage() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { settings } = useApp();
  const { tenant, tenantId, allCards, favorites, recentlyUsed } = useTenant();

  // Convex queries — only run when we have a tenantId
  const tenants = useQuery(api.tenants.listForUser) ?? [];
  const members = useQuery(
    api.tenantMembers.listMembers,
    tenantId ? { tenantId } : 'skip'
  );
  const myRole = useQuery(
    api.tenantMembers.getRole,
    tenantId ? { tenantId } : 'skip'
  );

  // Mutations
  const removeMemberMutation = useMutation(api.tenantMembers.removeMember);
  const deleteChildDataMutation = useMutation(api.dataManagement.deleteChildData);
  const exportChildDataMutation = useMutation(api.dataManagement.exportChildData);
  const withdrawConsentMutation = useMutation(api.consent.withdrawConsent);

  // Data management queries
  const dataSummary = useQuery(
    api.dataManagement.getDataSummary,
    tenantId ? { tenantId } : 'skip'
  );
  const consents = useQuery(
    api.consent.getConsents,
    tenantId ? { tenantId } : 'skip'
  );

  // Local state
  const [removing, setRemoving] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<string | null>(null);
  const [withdrawingConsent, setWithdrawingConsent] = useState<string | null>(null);

  const primaryColor = settings.primaryColor || '#4CAF50';
  const isOwner = myRole === 'owner';
  const isAuthenticated = clerkLoaded && !!user;

  // Derive usage stats from context
  const totalCards = allCards.length;
  const totalFavorites = favorites.length;
  const totalRecent = recentlyUsed.length;

  async function handleRemoveMember(userId: Id<'users'>) {
    if (!tenantId) return;
    const confirmed = window.confirm('Remove this member? They will lose access.');
    if (!confirmed) return;

    setRemoving(userId);
    try {
      await removeMemberMutation({ tenantId, userId });
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    } finally {
      setRemoving(null);
    }
  }

  // ── Derive active consents ────────────────────────────────
  const activeConsents = (consents ?? []).reduce<Record<string, boolean>>((acc, c) => {
    // Latest record per type wins
    if (!acc.hasOwnProperty(c.consentType)) {
      acc[c.consentType] = c.granted && !c.withdrawnAt;
    }
    return acc;
  }, {});

  const childName = tenant?.displayName || settings.childName || 'this child';

  // ── Handlers ─────────────────────────────────────────────

  const handleExportData = useCallback(async () => {
    if (!tenantId) return;
    setIsExporting(true);
    try {
      const data = await exportChildDataMutation({ tenantId });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(tenant?.subdomain || 'child')}-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  }, [tenantId, exportChildDataMutation, tenant?.subdomain]);

  const handleDeleteData = useCallback(async () => {
    if (!tenantId) return;
    setIsDeleting(true);
    try {
      const result = await deleteChildDataMutation({ tenantId });
      // Clear client-side localStorage as instructed by the mutation
      if (result.clientAction === 'CLEAR_LOCAL_STORAGE') {
        const keysToRemove = Object.keys(localStorage).filter(
          (k) => k.startsWith('jnr-') || k.startsWith('8gent-jr-')
        );
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }
      setDeleteResult(result.message);
      setShowDeleteModal(false);
      setDeleteConfirmName('');
    } catch (err: any) {
      alert(err.message || 'Failed to delete data');
    } finally {
      setIsDeleting(false);
    }
  }, [tenantId, deleteChildDataMutation]);

  const handleWithdrawConsent = useCallback(async (consentType: string) => {
    if (!tenantId) return;
    const info = CONSENT_LABELS[consentType];
    if (info?.required) {
      const ok = window.confirm(
        `"${info.label}" is required to use the app. Withdrawing it will effectively disable the app for ${childName}. Continue?`
      );
      if (!ok) return;
    }
    setWithdrawingConsent(consentType);
    try {
      await withdrawConsentMutation({ tenantId, consentType: consentType as any });

      // Sync withdrawal to localStorage so client-side gates take effect immediately
      if (typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem('8gent-jr-consents');
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed[consentType] = false;
            localStorage.setItem('8gent-jr-consents', JSON.stringify(parsed));
          }
        } catch { /* ignore parse errors */ }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw consent');
    } finally {
      setWithdrawingConsent(null);
    }
  }, [tenantId, withdrawConsentMutation, childName]);

  return (
    <div className="h-screen bg-[#f2f2f7] flex flex-col overflow-hidden">
      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl safe-top"
        style={{ backgroundColor: `${primaryColor}F2` }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/app"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-white/90 active:text-white"
          >
            <span className="text-[17px] flex items-center">
              <span className="text-2xl">&lsaquo;</span>
              <span className="ml-1">Back</span>
            </span>
          </Link>
          <h1 className="text-[18px] font-semibold text-white">Admin</h1>
          <div className="w-[44px]" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* ── Child Profile Card ────────────────────────── */}
        <div className="px-4 pt-6">
          <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
            Child Profile
          </p>
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-100">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {(tenant?.displayName || settings.childName || '?')[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[17px] font-semibold text-black truncate">
                  {tenant?.displayName || settings.childName || 'Not set'}
                </p>
                <p className="text-[13px] text-gray-400">
                  {tenant?.subdomain
                    ? `${tenant.subdomain}.8gentjr.com`
                    : 'No subdomain'}
                </p>
              </div>
              {tenant?.mode && (
                <span
                  className="px-2.5 py-1 rounded-lg text-[12px] font-semibold uppercase"
                  style={{
                    backgroundColor: tenant.mode === 'kid' ? '#E3F2FD' : '#F3E5F5',
                    color: tenant.mode === 'kid' ? '#1565C0' : '#7B1FA2',
                  }}
                >
                  {tenant.mode}
                </span>
              )}
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-[15px] text-gray-500">Created</span>
              <span className="text-[15px] text-black">
                {(tenant as any)?.createdAt
                  ? new Date((tenant as any).createdAt).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Members List ──────────────────────────────── */}
        {isAuthenticated && (
          <div className="px-4 pt-6">
            <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
              Members
            </p>
            <div className="bg-white rounded-xl overflow-hidden">
              {members === undefined ? (
                <div className="px-4 py-6 flex justify-center">
                  <div
                    className="w-6 h-6 border-3 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
                  />
                </div>
              ) : members.length === 0 ? (
                <p className="px-4 py-4 text-[15px] text-gray-400 text-center">
                  No members yet
                </p>
              ) : (
                members.map((m, i) => (
                  <div
                    key={m._id}
                    className={`px-4 py-3 flex items-center justify-between ${
                      i < members.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[14px] font-semibold text-gray-500">
                        {(m.user?.name || m.user?.email || '?')[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] text-black truncate">
                          {m.user?.name || m.user?.username || 'Unknown'}
                        </p>
                        <p className="text-[12px] text-gray-400 truncate">
                          {m.user?.email || ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={m.role} />
                      {isOwner && m.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(m.userId as Id<'users'>)}
                          disabled={removing === m.userId}
                          className="ml-1 w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 active:bg-red-100 disabled:opacity-50"
                        >
                          {removing === m.userId ? (
                            <span className="w-3 h-3 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sign-in prompt for non-authenticated */}
            {!isAuthenticated && (
              <p className="text-[13px] text-gray-400 text-center mt-3">
                Sign in to manage members
              </p>
            )}
          </div>
        )}

        {/* ── Usage Stats ──────────────────────────────── */}
        <div className="px-4 pt-6">
          <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
            Usage Stats
          </p>
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              <div className="px-3 py-4 text-center">
                <p className="text-[22px] font-bold" style={{ color: primaryColor }}>
                  {totalCards}
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">Cards</p>
              </div>
              <div className="px-3 py-4 text-center">
                <p className="text-[22px] font-bold" style={{ color: primaryColor }}>
                  {totalFavorites}
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">Favorites</p>
              </div>
              <div className="px-3 py-4 text-center">
                <p className="text-[22px] font-bold" style={{ color: primaryColor }}>
                  {totalRecent}
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">Recent</p>
              </div>
            </div>
          </div>

          {/* Tenant list for parents with multiple children */}
          {isAuthenticated && tenants.length > 1 && (
            <div className="mt-4">
              <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
                Your Accounts
              </p>
              <div className="bg-white rounded-xl overflow-hidden">
                {tenants.map((t, i) => (
                  <div
                    key={t._id}
                    className={`px-4 py-3 flex items-center justify-between ${
                      i < tenants.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div>
                      <p className="text-[15px] text-black">{t.displayName}</p>
                      <p className="text-[12px] text-gray-400">{t.subdomain}.8gentjr.com</p>
                    </div>
                    <span
                      className="text-[12px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: t._id === tenantId ? `${primaryColor}20` : '#F5F5F5',
                        color: t._id === tenantId ? primaryColor : '#9E9E9E',
                      }}
                    >
                      {t._id === tenantId ? 'Current' : t.mode}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Privacy & Data ────────────────────────────── */}
        {isOwner && tenantId && (
          <div className="px-4 pt-6">
            <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
              Privacy & Data
            </p>

            {/* Data Summary */}
            <div className="bg-white rounded-xl overflow-hidden mb-4">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[15px] font-semibold text-black">Data Summary</p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  What we store for {childName}
                </p>
              </div>
              {dataSummary === undefined ? (
                <div className="px-4 py-6 flex justify-center">
                  <div
                    className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
                  />
                </div>
              ) : dataSummary === null ? (
                <p className="px-4 py-4 text-[14px] text-gray-400 text-center">
                  Unable to load data summary
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  <div className="px-4 py-2.5 flex justify-between">
                    <span className="text-[15px] text-gray-600">Custom cards</span>
                    <span className="text-[15px] text-black font-medium">{dataSummary.customCards}</span>
                  </div>
                  <div className="px-4 py-2.5 flex justify-between">
                    <span className="text-[15px] text-gray-600">Favorites</span>
                    <span className="text-[15px] text-black font-medium">{dataSummary.favorites}</span>
                  </div>
                  <div className="px-4 py-2.5 flex justify-between">
                    <span className="text-[15px] text-gray-600">Communication records</span>
                    <span className="text-[15px] text-black font-medium">{dataSummary.sentenceHistory}</span>
                  </div>
                  <div className="px-4 py-2.5 flex justify-between">
                    <span className="text-[15px] text-gray-600">Recently used cards</span>
                    <span className="text-[15px] text-black font-medium">{dataSummary.recentlyUsed}</span>
                  </div>
                  <div className="px-4 py-2.5 flex justify-between">
                    <span className="text-[15px] text-gray-600">Consent records (audit)</span>
                    <span className="text-[15px] text-black font-medium">{dataSummary.consentRecords}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Consent Management */}
            <div className="bg-white rounded-xl overflow-hidden mb-4">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[15px] font-semibold text-black">Consent Management</p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Control what data processing is allowed
                </p>
              </div>
              {Object.entries(CONSENT_LABELS).map(([type, info], i, arr) => {
                const isActive = activeConsents[type] ?? false;
                const isWithdrawing = withdrawingConsent === type;
                return (
                  <div
                    key={type}
                    className={`px-4 py-3 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="flex items-center gap-2">
                          <p className="text-[15px] text-black">{info.label}</p>
                          {info.required && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 uppercase">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-gray-400 mt-0.5">{info.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <span className="text-[12px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="text-[12px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            Withdrawn
                          </span>
                        )}
                        {isActive && (
                          <button
                            onClick={() => handleWithdrawConsent(type)}
                            disabled={isWithdrawing}
                            className="text-[13px] text-red-500 font-medium disabled:opacity-50"
                          >
                            {isWithdrawing ? '...' : 'Withdraw'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Export & Delete */}
            <div className="bg-white rounded-xl overflow-hidden mb-4">
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 active:bg-gray-50 disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span className="text-[17px] text-blue-500 font-medium">
                    {isExporting ? 'Exporting...' : `Download ${childName}'s data`}
                  </span>
                </div>
                <span className="text-gray-300 text-[20px]">&rsaquo;</span>
              </button>
            </div>

            {/* Delete All Data — visually separated */}
            <div className="bg-white rounded-xl overflow-hidden border border-red-200">
              <div className="px-4 py-3 border-b border-red-100 bg-red-50/50">
                <p className="text-[15px] font-semibold text-red-700">Danger Zone</p>
                <p className="text-[12px] text-red-400 mt-0.5">
                  These actions cannot be undone
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-between px-4 py-3 active:bg-red-50"
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                  <span className="text-[17px] text-red-500 font-medium">
                    Delete all of {childName}&apos;s data
                  </span>
                </div>
                <span className="text-red-300 text-[20px]">&rsaquo;</span>
              </button>
            </div>

            {/* Success message after deletion */}
            {deleteResult && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <p className="text-[14px] text-green-700">{deleteResult}</p>
                <button
                  onClick={() => setDeleteResult(null)}
                  className="text-[13px] text-green-500 mt-1 font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Delete Confirmation Modal ──────────────────── */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
              <div className="px-5 pt-5 pb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-semibold text-black text-center">
                  Delete all data?
                </h3>
                <p className="text-[14px] text-gray-500 text-center mt-2 leading-relaxed">
                  This will permanently delete all of {childName}&apos;s communication history,
                  personalization data, and usage records. This cannot be undone.
                </p>
                <p className="text-[13px] text-gray-400 text-center mt-2">
                  Consent records will be preserved for legal compliance.
                </p>

                {/* Type name to confirm */}
                <div className="mt-4">
                  <p className="text-[13px] text-gray-500 mb-1.5">
                    Type <strong>{childName}</strong> to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmName}
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                    placeholder={childName}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[15px] focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmName('');
                  }}
                  className="flex-1 py-3.5 text-[17px] font-medium text-blue-500 active:bg-gray-50 border-r border-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteData}
                  disabled={deleteConfirmName !== childName || isDeleting}
                  className="flex-1 py-3.5 text-[17px] font-semibold text-red-500 active:bg-red-50 disabled:text-red-300 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Quick Actions ─────────────────────────────── */}
        <div className="px-4 pt-6 pb-8">
          <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
            Quick Actions
          </p>
          <div className="bg-white rounded-xl overflow-hidden">
            <Link
              href="/onboarding?restart=1"
              className="flex items-center justify-between px-4 py-3 border-b border-gray-100 active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                <span className="text-[17px] text-black">Restart Onboarding</span>
              </div>
              <span className="text-gray-300 text-[20px]">&rsaquo;</span>
            </Link>
            <Link
              href="/app"
              className="flex items-center justify-between px-4 py-3 border-b border-gray-100 active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                <span className="text-[17px] text-black">Manage Cards</span>
              </div>
              <span className="text-gray-300 text-[20px]">&rsaquo;</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center justify-between px-4 py-3 border-b border-gray-100 active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span className="text-[17px] text-black">Settings</span>
              </div>
              <span className="text-gray-300 text-[20px]">&rsaquo;</span>
            </Link>
            <Link
              href="/analytics"
              className="flex items-center justify-between px-4 py-3 active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <span className="text-[17px] text-black">View Analytics</span>
              </div>
              <span className="text-gray-300 text-[20px]">&rsaquo;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Dock */}
      <Dock primaryColor={primaryColor} />
    </div>
  );
}
