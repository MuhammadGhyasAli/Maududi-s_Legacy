'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

export default function SettingsPage() {
  const { user, token, loading: authLoading, updateProfile, changePassword, deleteAccount } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !token)) {
      router.push('/auth/login');
    }
  }, [user, token, authLoading, router]);

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteErr, setDeleteErr] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !token) return null;

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setProfileLoading(true);
    try {
      const data: { display_name?: string; email?: string } = {};
      if (displayName !== user.display_name) data.display_name = displayName;
      if (email !== user.email) data.email = email;
      if (Object.keys(data).length === 0) {
        setProfileMsg('No changes to save');
        return;
      }
      await updateProfile(data);
      setProfileMsg('Profile updated successfully');
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');
    if (newPassword !== confirmNewPassword) {
      setPasswordErr('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErr('New password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordErr(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    setDeleteErr('');
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
      router.push('/');
    } catch (err) {
      setDeleteErr(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Account Settings</h1>

      <section className="bg-white dark:bg-brand-card-dark rounded-lg border border-gray-200 dark:border-gray-700/50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile</h2>
        {profileMsg && <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300" role="status">{profileMsg}</div>}
        {profileErr && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300" role="alert">{profileErr}</div>}
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
            <input id="displayName" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all duration-200" />
          </div>
          <div>
            <label htmlFor="settingsEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input id="settingsEmail" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all duration-200" />
          </div>
          <button type="submit" disabled={profileLoading} className="px-6 py-2.5 rounded-lg bg-brand-green hover:bg-brand-green-dark text-white font-medium disabled:opacity-50 transition-all cursor-pointer">
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>

      <section className="bg-white dark:bg-brand-card-dark rounded-lg border border-gray-200 dark:border-gray-700/50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Change Password</h2>
        {passwordMsg && <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300" role="status">{passwordMsg}</div>}
        {passwordErr && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300" role="alert">{passwordErr}</div>}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required autoComplete="current-password" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all duration-200" />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} autoComplete="new-password" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all duration-200" />
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required minLength={6} autoComplete="new-password" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all duration-200" />
          </div>
          <button type="submit" disabled={passwordLoading} className="px-6 py-2.5 rounded-lg bg-brand-green hover:bg-brand-green-dark text-white font-medium disabled:opacity-50 transition-all cursor-pointer">
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </section>

      <section className="bg-white dark:bg-brand-card-dark rounded-lg border border-red-200 dark:border-red-900/50 p-6">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Once you delete your account, there is no going back.</p>
        {deleteErr && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300" role="alert">{deleteErr}</div>}

        {!showDeleteConfirm ? (
          <button onClick={handleDeleteAccount} className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors cursor-pointer">
            Delete My Account
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">Type your password to confirm deletion:</p>
            <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Enter your password" autoComplete="off" className="w-full px-4 py-3 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200" />
            <div className="flex gap-3">
              <button onClick={handleDeleteAccount} disabled={deleteLoading || !deletePassword} className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 transition-colors cursor-pointer">
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }} className="px-6 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
