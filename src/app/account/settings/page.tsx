'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

function InputField({ id, label, type, value, onChange, disabled, placeholder, error }: {
  id: string; label: string; type?: string; value: string; onChange?: (v: string) => void;
  disabled?: boolean; placeholder?: string; error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <input
        id={id} type={type || 'text'} value={value}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
          error
            ? 'border-red-300 dark:border-red-700 focus:ring-red-300 focus:border-red-400'
            : 'border-gray-300 dark:border-gray-600 focus:ring-brand-green/30 focus:border-brand-green'
        } ${
          disabled
            ? 'bg-gray-50 dark:bg-brand-bg-dark text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 placeholder-gray-400'
        } focus:outline-none focus:ring-2`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-brand-card-dark rounded-xl border border-gray-200 dark:border-gray-700/50 p-6">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h2>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{description}</p>}
      {children}
    </div>
  );
}

function Alert({ type, message, onDismiss }: { type: 'success' | 'error'; message: string; onDismiss?: () => void }) {
  const styles = type === 'success'
    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
    : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400';
  return (
    <div className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm ${styles}`} role={type === 'error' ? 'alert' : 'status'}>
      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {type === 'success'
          ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
      </svg>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 hover:opacity-70 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default function SettingsPage() {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const router = useRouter();

  // Profile state
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete account state
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-8">
        {/* Profile */}
        <Card title="Profile" description="Update your display name and personal information">
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            {profileError && <Alert type="error" message={profileError} onDismiss={() => setProfileError('')} />}
            {profileSuccess && <Alert type="success" message={profileSuccess} onDismiss={() => setProfileSuccess('')} />}

            <InputField id="email" label="Email" type="email" value={user?.email || ''} disabled />

            <InputField
              id="displayName" label="Display name" value={displayName}
              onChange={setDisplayName} placeholder="Your display name"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2 rounded-lg text-white font-semibold text-sm bg-brand-green hover:bg-brand-green-dark active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {profileLoading ? <span className="flex items-center gap-2"><Spinner />Saving...</span> : 'Save changes'}
              </button>
            </div>
          </form>
        </Card>

        {/* Password */}
        <Card title="Change Password" description="Update your account password">
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {passwordError && <Alert type="error" message={passwordError} onDismiss={() => setPasswordError('')} />}
            {passwordSuccess && <Alert type="success" message={passwordSuccess} onDismiss={() => setPasswordSuccess('')} />}

            <InputField
              id="currentPassword" label="Current password" type="password"
              value={currentPassword} onChange={setCurrentPassword} placeholder="Enter current password"
            />

            <InputField
              id="newPassword" label="New password" type="password"
              value={newPassword} onChange={setNewPassword} placeholder="Enter new password"
            />

            <InputField
              id="confirmPassword" label="Confirm new password" type="password"
              value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2 rounded-lg text-white font-semibold text-sm bg-brand-green hover:bg-brand-green-dark active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {passwordLoading ? <span className="flex items-center gap-2"><Spinner />Changing...</span> : 'Change password'}
              </button>
            </div>
          </form>
        </Card>

        {/* Delete Account */}
        <Card title="Delete Account" description="Permanently delete your account and all data">
          {!showDeleteConfirm ? (
            <div>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">This action cannot be undone.</p>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/50 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Delete my account
              </button>
            </div>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-5">
              {deleteError && <Alert type="error" message={deleteError} onDismiss={() => setDeleteError('')} />}

              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                <p className="font-medium mb-1">Warning: This will permanently delete your account.</p>
                <p>All your data, reading history, and preferences will be removed.</p>
              </div>

              <InputField
                id="deletePassword" label="Enter your password to confirm" type="password"
                value={deletePassword} onChange={setDeletePassword} placeholder="Your password"
              />

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={deleteLoading || !deletePassword}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  {deleteLoading ? <span className="flex items-center gap-2"><Spinner />Deleting...</span> : 'Permanently delete'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); setDeletePassword(''); }}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </Card>

        {/* Sign Out */}
        <Card title="Sign Out" description="Sign out of your account on this device">
          <button
            type="button"
            onClick={() => { logout(); router.push('/'); }}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/50 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            Sign out
          </button>
        </Card>
      </div>
    </div>
  );
}
