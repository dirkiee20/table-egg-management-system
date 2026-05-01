import sys

file_path = 'd:/table-egg-management-system/frontend/src/pages/Calendar.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replacements
replacements = {
    "backgroundColor: isCurrentMonth ? 'white' : '#f8fafc',": "backgroundColor: isCurrentMonth ? 'var(--bg-surface)' : 'var(--bg-surface-2)',",
    "borderRight: '1px solid #e2e8f0',": "borderRight: '1px solid var(--border-color)',",
    "borderBottom: '1px solid #e2e8f0'": "borderBottom: '1px solid var(--border-color)'",
    "borderLeft: '1px solid #e2e8f0', borderTop: '1px solid #e2e8f0'": "borderLeft: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)'",
    "color: isToday ? 'white' : (isCurrentMonth ? 'var(--text-main)' : '#94a3b8'),": "color: isToday ? 'white' : (isCurrentMonth ? 'var(--text-main)' : 'var(--text-placeholder)'),",
    "backgroundColor: 'white' }": "backgroundColor: 'var(--bg-surface)' }",
    "backgroundColor: '#f8fafc', position: 'relative'": "backgroundColor: 'var(--bg-surface-2)', position: 'relative'",
    "let bgColor = '#f1f5f9'; let textColor = '#475569'; let borderColor = '#cbd5e1';": "let bgColor = 'var(--bg-app)'; let textColor = 'var(--text-secondary)'; let borderColor = 'var(--border-color)';",
    "bgColor = '#fee2e2'; textColor = '#b91c1c'; borderColor = '#fca5a5';": "bgColor = 'var(--danger-bg)'; textColor = 'var(--danger-text)'; borderColor = 'var(--danger)';",
    "bgColor = '#dbeafe'; textColor = '#1d4ed8'; borderColor = '#93c5fd';": "bgColor = 'var(--info-bg)'; textColor = 'var(--info-text)'; borderColor = 'var(--info)';",
    "bgColor = '#fef9c3'; textColor = '#a16207'; borderColor = '#fde047';": "bgColor = 'var(--warning-bg)'; textColor = 'var(--warning-text)'; borderColor = 'var(--warning)';",
    "bgColor = '#dcfce7';": "bgColor = 'var(--success-bg)';",
    "textColor = '#166534';": "textColor = 'var(--success-text)';",
    "borderColor = '#22c55e';": "borderColor = 'var(--success)';"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w') as f:
    f.write(content)
print('Done!')
