'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

type Tab = 'profile' | 'password' | 'danger';

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function getInitials(name: string, email: string): string {
  if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return email[0].toUpperCase();
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'profile', label: 'Profile', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  { id: 'password', label: 'Password', icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z' },
  { id: 'danger', label: 'Danger Zone', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
];

export default function SettingsPage() {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete account
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    try {
      await updateProfile({ display_name: displayName });
      setProfileSuccess('Profile updated successfully');
    } catch {
      setProfileError('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword) { setPasswordError('Current password is required'); return; }
    if (!newPassword) { setPasswordError('New password is required'); return; }
    if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
      router.push('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const userInitials = user ? getInitials(user.display_name, user.email) : '?';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Account Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your profile, password, and account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white dark:bg-brand-card-dark rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
            {/* Avatar card */}
            <div className="p-6 text-center border-b border-gray-100 dark:border-gray-800">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                <span className="text-xl font-bold text-white">{userInitials}</span>
              </div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user?.display_name || 'User'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-1">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                const isDanger = tab.id === 'danger';
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'danger') setShowDeleteConfirm(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left cursor-pointer ${
                      isActive
                        ? isDanger
                          ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60'
                          : 'bg-emerald-50 dark:bg-emerald-950/30 text-brand-green dark:text-brand-green-dark border border-emerald-200 dark:border-emerald-800/60'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <svg className={`w-5 h-5 ${isActive && isDanger ? 'text-red-500' : isActive ? 'text-brand-green' : 'text-gray-400 dark:text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                    </svg>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Profile Section */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-brand-card-dark rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Profile</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your personal information</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
                {profileError && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60" role="alert">
                    <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-red-600 dark:text-red-400">{profileError}</div>
                  </div>
                )}

                {profileSuccess && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/60" role="status">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-green-600 dark:text-green-400">{profileSuccess}</div>
                  </div>
                )}

                <div>
                  <label htmlFor="settings-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="settings-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-brand-bg-dark text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm"
                  />
                  <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="settings-displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Display name
                  </label>
                  <input
                    id="settings-displayName"
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm transition-all duration-200"
                  />
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                  >
                    {profileLoading ? (
                      <span className="flex items-center gap-2"><Spinner />Saving...</span>
                    ) : (
                      'Save changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Section */}
          {activeTab === 'password' && (
            <div className="bg-white dark:bg-brand-card-dark rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Change Password</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your account password</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
                {passwordError && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60" role="alert">
                    <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-red-600 dark:text-red-400">{passwordError}</div>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/60" role="status">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-green-600 dark:text-green-400">{passwordSuccess}</div>
                  </div>
                )}

                <div>
                  <label htmlFor="settings-currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Current password
                  </label>
                  <input
                    id="settings-currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm transition-all duration-200"
                  />
                </div>

                <hr className="border-gray-100 dark:border-gray-800" />

                <div>
                  <label htmlFor="settings-newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    New password
                  </label>
                  <input
                    id="settings-newPassword"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Create a new password"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="settings-confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    id="settings-confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm transition-all duration-200"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                  >
                    {passwordLoading ? (
                      <span className="flex items-center gap-2"><Spinner />Changing...</span>
                    ) : (
                      'Update password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Danger Zone */}
          {activeTab === 'danger' && (
            <div className="space-y-6">
              {/* Sign Out */}
              <div className="bg-white dark:bg-brand-card-dark rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Sign Out</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign out of your account on this device</p>
                </div>
                <div className="p-6">
                  <button
                    type="button"
                    onClick={() => { logout(); router.push('/'); }}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 hover:bg-red-100 dark:hover:bg-red-950/50 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              </div>

              {/* Delete Account */}
              <div className="bg-white dark:bg-brand-card-dark rounded-2xl border border-red-200 dark:border-red-900/50 overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-red-100 dark:border-red-900/30 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20">
                  <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Delete Account</h2>
                  <p className="text-sm text-red-500/70 dark:text-red-400/70 mt-1">Permanently delete your account and all associated data</p>
                </div>

                <div className="p-6">
                  {!showDeleteConfirm ? (
                    <div>
                      <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60">
                        <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <div className="text-sm text-red-600 dark:text-red-400">
                          <p className="font-medium mb-1">This action cannot be undone.</p>
                          <p>Your reading history, preferences, and all account data will be permanently removed.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-lg shadow-red-500/25 transition-all duration-200 cursor-pointer"
                      >
                        Delete my account
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleDeleteAccount} className="space-y-5">
                      {deleteError && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60" role="alert">
                          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="text-sm text-red-600 dark:text-red-400">{deleteError}</div>
                        </div>
                      )}

                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          <span className="font-semibold">Are you sure?</span> Please enter your password to confirm permanent deletion.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="settings-deletePassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Enter your password to confirm
                        </label>
                        <input
                          id="settings-deletePassword"
                          type="password"
                          value={deletePassword}
                          onChange={e => setDeletePassword(e.target.value)}
                          placeholder="Your current password"
                          autoComplete="current-password"
                          className="w-full px-4 py-3 rounded-xl border border-red-300 dark:border-red-700 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-sm transition-all duration-200"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={deleteLoading || !deletePassword}
                          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                        >
                          {deleteLoading ? (
                            <span className="flex items-center gap-2"><Spinner />Deleting...</span>
                          ) : (
                            'Permanently delete account'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); setDeletePassword(''); }}
                          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}