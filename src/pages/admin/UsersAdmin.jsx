import { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useData } from '../../contexts/DataContext';
import { ROLES, roleLabel } from '../../data/permissions';
import { Users, Plus, Trash2 } from 'lucide-react';

export default function UsersAdmin() {
  const { users, currentUser, addUser, updateUser, removeUser } = useUser();
  const { logEvent } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Contributor');

  const submit = () => {
    if (!name.trim() || !email.trim()) return;
    const u = addUser({ name: name.trim(), email: email.trim(), role });
    logEvent('user.create', { type: 'user', id: u.id }, null, role);
    setName(''); setEmail(''); setRole('Contributor');
  };

  const changeRole = (id, newRole) => {
    updateUser(id, { role: newRole });
    logEvent('role.change', { type: 'user', id }, null, newRole);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-text">
          <h1>User Management</h1>
          <p>Add team members and assign their role. Role drives what each person can access.</p>
        </div>
      </div>

      {/* Add user */}
      <div className="card" style={{ padding: 'var(--space-4) var(--space-5)', marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: 'var(--space-3)', alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email</label>
            <input className="form-input" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Role</label>
            <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 'var(--space-3)' }}>
          <button className="btn btn-primary" disabled={!name.trim() || !email.trim()} onClick={submit}><Plus size={15} /> Add user</button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th style={{ width: 240 }}>Role</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.name}{u.id === currentUser.id && <span className="badge badge-blue" style={{ marginLeft: 6, fontSize: 'var(--font-xs)' }}>you</span>}</td>
                <td style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-500)' }}>{u.email}</td>
                <td>
                  <select className="form-select" value={u.role} onChange={e => changeRole(u.id, e.target.value)} style={{ height: 32, fontSize: 'var(--font-sm)' }}>
                    {ROLES.map(r => <option key={r.key} value={r.key}>{roleLabel(r.key)}</option>)}
                  </select>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" disabled={users.length <= 1} onClick={() => removeUser(u.id)} title="Remove user">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-400)', marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Users size={13} /> MVP note: no real authentication — use the top-bar switcher to act as any user. Real sign-in is a backend concern.
      </p>
    </div>
  );
}
