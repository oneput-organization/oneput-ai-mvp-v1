import { createContext, useContext, useState, useCallback } from 'react';
import { storage } from '../utils/storage';
import { can as canForRole } from '../data/permissions';

// Users + the current user. MVP has no auth — a role switcher (see TopBar) simulates "logging in"
// as each role. This is the seam where real authentication slots in later.

const UserContext = createContext();

// One seed user per role so every role is selectable out of the box.
const DEFAULT_USERS = [
  { id: 'u-admin', name: 'Alex Admin', email: 'admin@oneput.ai', role: 'Admin' },
  { id: 'u-contributor', name: 'Casey Contributor', email: 'contributor@oneput.ai', role: 'Contributor' },
  { id: 'u-reviewer', name: 'Riley Reviewer', email: 'reviewer@oneput.ai', role: 'Reviewer' },
  { id: 'u-approver', name: 'Avery Approver', email: 'approver@oneput.ai', role: 'Approver' },
  { id: 'u-auditor', name: 'Quinn Auditor', email: 'auditor@oneput.ai', role: 'ExternalAuditor' },
];

export function UserProvider({ children }) {
  const [users, setUsersState] = useState(() => storage.get('users', DEFAULT_USERS));
  const [currentUserId, setCurrentUserIdState] = useState(() => storage.get('currentUserId', DEFAULT_USERS[0].id));

  const setUsers = useCallback((next) => {
    setUsersState(next);
    storage.set('users', next);
  }, []);

  const switchUser = useCallback((id) => {
    setCurrentUserIdState(id);
    storage.set('currentUserId', id);
  }, []);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Bound to the current user's role — gate UI/actions with this.
  const can = useCallback((perm) => canForRole(currentUser?.role, perm), [currentUser]);

  return (
    <UserContext.Provider value={{
      users,
      setUsers,
      currentUser,
      role: currentUser?.role,
      switchUser,
      can,
    }}>
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);
