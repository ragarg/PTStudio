import { useUIStore } from "../../../stores/uiStore";
import { TABS } from "./tabs";
import styles from './SettingsMenu.module.css';

export default function SettingsMenu() {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  const current = TABS.find((t) => t.id === activeTab) ?? TABS[0];
  const Content = current.component;

  return (
    <aside className={styles.menu} aria-label="Параметры сцены">
      <nav className={styles.tabs} aria-label="Разделы настроек">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${tab.id === activeTab ? styles.active : ''}`}
            type="button"
            aria-label={tab.label}
            aria-pressed={tab.id === activeTab}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </nav>
      <div className={styles.content}>
        <header className={styles.header}>
          <h2>{current.label}</h2>
        </header>
        <div className={styles.settingsSection}>
          <Content />
        </div>
      </div>
    </aside>
  );
}