import { useThemeMode } from '../context/ThemeContext.jsx';
import { useState } from 'react';

export default function DataManagement({ onClose }) {
  const { isDark } = useThemeMode();
  const [activeTab, setActiveTab] = useState('export');
  const [exportData, setExportData] = useState(null);
  const [importStatus, setImportStatus] = useState(null);

  const exportUserData = () => {
    try {
      const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        userData: {
          // Journal entries
          journalEntries: JSON.parse(localStorage.getItem('mood-journal-entries') || '[]'),
          
          // Breathing sessions
          breathingSessions: JSON.parse(localStorage.getItem('breathing-sessions') || '[]'),
          
          // Progress data
          progressData: JSON.parse(localStorage.getItem('progress-data') || '{}'),
          
          // Achievements
          achievements: JSON.parse(localStorage.getItem('user-achievements') || '[]'),
          
          // Notification preferences
          notificationPreferences: JSON.parse(localStorage.getItem('notification-preferences') || '{}'),
          
          // Notification history
          notificationHistory: JSON.parse(localStorage.getItem('notification-history') || '[]'),
          
          // Theme preference
          themePreference: localStorage.getItem('theme-mode') || 'light',
          
          // User profile
          userProfile: JSON.parse(localStorage.getItem('user-profile') || '{}'),
          
          // Personalization settings
          personalizationSettings: JSON.parse(localStorage.getItem('personalization-settings') || '{}'),
          
          // Streaks and goals
          streakData: JSON.parse(localStorage.getItem('streak-data') || '{}'),
        },
        statistics: {
          totalEntries: JSON.parse(localStorage.getItem('mood-journal-entries') || '[]').length,
          totalBreathingSessions: JSON.parse(localStorage.getItem('breathing-sessions') || '[]').length,
          firstEntry: getFirstEntryDate(),
          dataSize: calculateDataSize()
        }
      };
      
      setExportData(data);
      return data;
    } catch (error) {
      console.error('Export error:', error);
      setImportStatus({ type: 'error', message: 'Failed to export data' });
      return null;
    }
  };

  const downloadData = () => {
    const data = exportUserData();
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuracare-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setImportStatus({ type: 'success', message: 'Data exported successfully!' });
  };

  const importUserData = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate data structure
      if (!data.version || !data.userData) {
        throw new Error('Invalid data format');
      }

      // Backup current data
      const backup = {
        timestamp: new Date().toISOString(),
        data: {}
      };

      Object.keys(data.userData).forEach(key => {
        const storageKey = getStorageKey(key);
        backup.data[storageKey] = localStorage.getItem(storageKey);
      });

      // Store backup
      localStorage.setItem('data-backup', JSON.stringify(backup));

      // Import new data
      Object.entries(data.userData).forEach(([key, value]) => {
        const storageKey = getStorageKey(key);
        if (value !== null && value !== undefined) {
          localStorage.setItem(storageKey, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });

      setImportStatus({ 
        type: 'success', 
        message: `Data imported successfully! Imported ${Object.keys(data.userData).length} data categories.` 
      });

      // Refresh the page after a delay to load new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Import error:', error);
      setImportStatus({ 
        type: 'error', 
        message: 'Failed to import data. Please check the file format.' 
      });
    }
  };

  const getStorageKey = (key) => {
    const keyMap = {
      journalEntries: 'mood-journal-entries',
      breathingSessions: 'breathing-sessions',
      progressData: 'progress-data',
      achievements: 'user-achievements',
      notificationPreferences: 'notification-preferences',
      notificationHistory: 'notification-history',
      themePreference: 'theme-mode',
      userProfile: 'user-profile',
      personalizationSettings: 'personalization-settings',
      streakData: 'streak-data'
    };
    return keyMap[key] || key;
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      const keysToRemove = [
        'mood-journal-entries',
        'breathing-sessions',
        'progress-data',
        'user-achievements',
        'notification-preferences',
        'notification-history',
        'user-profile',
        'personalization-settings',
        'streak-data'
      ];

      keysToRemove.forEach(key => localStorage.removeItem(key));
      setImportStatus({ type: 'success', message: 'All data cleared successfully!' });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const restoreBackup = () => {
    try {
      const backup = JSON.parse(localStorage.getItem('data-backup') || '{}');
      if (!backup.data) {
        setImportStatus({ type: 'error', message: 'No backup found' });
        return;
      }

      Object.entries(backup.data).forEach(([key, value]) => {
        if (value !== null) {
          localStorage.setItem(key, value);
        } else {
          localStorage.removeItem(key);
        }
      });

      setImportStatus({ type: 'success', message: 'Backup restored successfully!' });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setImportStatus({ type: 'error', message: 'Failed to restore backup' });
    }
  };

  const getFirstEntryDate = () => {
    const entries = JSON.parse(localStorage.getItem('mood-journal-entries') || '[]');
    if (entries.length === 0) return null;
    
    const dates = entries.map(entry => new Date(entry.date));
    return new Date(Math.min(...dates)).toISOString();
  };

  const calculateDataSize = () => {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    return `${(totalSize / 1024).toFixed(2)} KB`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-2xl w-full rounded-xl max-h-[80vh] overflow-y-auto ${
        isDark ? 'bg-purple-950 border-purple-500/20' : 'bg-white border-gray-200'
      } border`}>
        {/* Header */}
        <div className="sticky top-0 bg-inherit p-6 border-b border-purple-500/20">
          <div className="flex justify-between items-center">
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Data Management
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'}`}
            >
              ✕
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {['export', 'import', 'backup'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? isDark ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'
                    : isDark ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Messages */}
          {importStatus && (
            <div className={`p-4 rounded-lg mb-6 ${
              importStatus.type === 'success'
                ? isDark ? 'bg-green-900/50 border-green-500/50 text-green-300' : 'bg-green-50 border-green-200 text-green-800'
                : isDark ? 'bg-red-900/50 border-red-500/50 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
            } border`}>
              {importStatus.message}
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Export Your Data
                </h4>
                <p className={`mb-4 ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
                  Download all your journal entries, breathing sessions, progress data, and settings as a JSON file.
                </p>
                
                <button
                  onClick={downloadData}
                  className={`w-full p-4 rounded-lg border-2 border-dashed ${
                    isDark 
                      ? 'border-purple-500/50 text-purple-300 hover:bg-purple-900/30' 
                      : 'border-purple-300 text-purple-600 hover:bg-purple-50'
                  } font-medium transition-colors`}
                >
                  📥 Download Data Export
                </button>
              </div>

              {exportData && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                  <h5 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Export Preview
                  </h5>
                  <div className={`text-sm space-y-1 ${isDark ? 'text-purple-300' : 'text-gray-600'}`}>
                    <div>Journal Entries: {exportData.statistics.totalEntries}</div>
                    <div>Breathing Sessions: {exportData.statistics.totalBreathingSessions}</div>
                    <div>Data Size: {exportData.statistics.dataSize}</div>
                    {exportData.statistics.firstEntry && (
                      <div>First Entry: {new Date(exportData.statistics.firstEntry).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div>
                <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Import Data
                </h4>
                <p className={`mb-4 ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
                  Import data from a previously exported JSON file. This will merge with your existing data.
                </p>
                
                <div className={`p-4 rounded-lg border-2 border-dashed ${
                  isDark 
                    ? 'border-purple-500/50 bg-purple-900/20' 
                    : 'border-purple-300 bg-purple-50'
                }`}>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) importUserData(file);
                    }}
                    className={`w-full p-2 rounded border ${
                      isDark ? 'bg-purple-900/50 border-purple-500/30 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <p className={`text-sm mt-2 ${isDark ? 'text-purple-300' : 'text-gray-500'}`}>
                    Select a NeuraCare data export file (.json)
                  </p>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/50 border-yellow-500/50' : 'bg-yellow-50 border-yellow-200'} border`}>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-500 text-lg">⚠️</span>
                  <div>
                    <h5 className={`font-medium ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
                      Import Warning
                    </h5>
                    <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      Importing will merge the data with your existing records. A backup of your current data will be created automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Backup & Recovery
                </h4>
                <p className={`mb-4 ${isDark ? 'text-purple-200' : 'text-gray-600'}`}>
                  Manage your data backups and perform recovery operations.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={restoreBackup}
                  className={`w-full p-4 rounded-lg border ${
                    isDark 
                      ? 'border-blue-500/50 text-blue-300 hover:bg-blue-900/30' 
                      : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                  } font-medium transition-colors`}
                >
                  🔄 Restore Last Backup
                </button>

                <button
                  onClick={clearAllData}
                  className={`w-full p-4 rounded-lg border ${
                    isDark 
                      ? 'border-red-500/50 text-red-300 hover:bg-red-900/30' 
                      : 'border-red-300 text-red-600 hover:bg-red-50'
                  } font-medium transition-colors`}
                >
                  🗑️ Clear All Data
                </button>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/50 border-red-500/50' : 'bg-red-50 border-red-200'} border`}>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <div>
                    <h5 className={`font-medium ${isDark ? 'text-red-200' : 'text-red-800'}`}>
                      Danger Zone
                    </h5>
                    <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                      Clearing all data will permanently delete your journal entries, progress, and settings. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}