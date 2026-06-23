import { useLang } from '../context/LangContext';

export default function TabBar({ activeTab, onTabChange, isAdmin }) {
  const { t } = useLang();

  const tabs = [
    { key: 'dashboard', icon: '🗓', label: t('tabHours') },
    { key: 'export', icon: '📄', label: t('tabExportShort') },
    { key: 'shifts', icon: '🔄', label: t('tabShifts') },
  ];

  if (isAdmin) {
    tabs.push({ key: 'admin', icon: '⚙️', label: t('tabAdmin'), admin: true });
  }

  return (
    <nav className="tabbar">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={'tab-item' + (activeTab === tab.key ? ' active' : '') + (tab.admin ? ' tab-admin' : '')}
          onClick={() => onTabChange(tab.key)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
