import {
  Files,
  Search,
  GitBranch,
  PlaySquare,
  Blocks,
  Container,
  CheckCircle2,
  Sparkles,
  LineChart,
  Database,
  FolderKanban,
  Settings
} from 'lucide-react';

export default function ActivityBar({ activeView, onViewChange, onToggleAgent, agentOpen }) {
  const activities = [
    { id: 'explorer', label: 'Explorer', icon: Files },
    { id: 'search', label: 'Search Workspace', icon: Search },
    { id: 'git', label: 'Source Control', icon: GitBranch },
    { id: 'runner', label: 'Run & Debug', icon: PlaySquare },
    { id: 'visualizer', label: 'Learning & Visualizer', icon: LineChart },
    { id: 'extensions', label: 'Extensions', icon: Blocks },
    { id: 'docker', label: 'Docker', icon: Container },
    { id: 'testing', label: 'Testing', icon: CheckCircle2 },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'workspace', label: 'Workspace Profiles', icon: FolderKanban }
  ];

  return (
    <div className="activity-bar">
      <div className="activity-top">
        {activities.map((act) => {
          const Icon = act.icon;
          const isActive = activeView === act.id;
          return (
            <button
              key={act.id}
              className={`activity-btn ${isActive ? 'active' : ''}`}
              title={act.label}
              onClick={() => onViewChange(act.id)}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>

      <div className="activity-bottom">
        <button
          className={`activity-btn ${agentOpen ? 'active' : ''}`}
          title="SPVM3 AI Agent Panel"
          onClick={onToggleAgent}
        >
          <Sparkles size={20} color="var(--accent)" />
        </button>
        <button
          className={`activity-btn ${activeView === 'settings' ? 'active' : ''}`}
          title="Settings & Preferences"
          onClick={() => onViewChange('settings')}
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}
