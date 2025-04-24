import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { migrateAllUsers } from '../utils/migrateUserData';

// List of admin user emails
const ADMIN_EMAILS = [
  // Add your admin email here
];

function AdminTools() {
  const [migrating, setMigrating] = useState(false);
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email)) {
    return null;
  }

  const handleMigration = async () => {
    if (!window.confirm('Are you sure you want to migrate all user data?')) {
      return;
    }

    setMigrating(true);
    try {
      const result = await migrateAllUsers();
      if (result.success) {
        addToast(`Successfully migrated ${result.migratedCount} user(s)`, 'success');
      } else {
        addToast('Migration failed: ' + result.error, 'error');
      }
    } catch (error) {
      addToast('Migration failed: ' + error.message, 'error');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleMigration}
        disabled={migrating}
        className={`cyber-button-small bg-red-600 hover:bg-red-700 ${
          migrating ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {migrating ? 'Migrating...' : 'Migrate User Data'}
      </button>
    </div>
  );
}

export default AdminTools; 