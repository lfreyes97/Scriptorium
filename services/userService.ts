import { User, UserRole, RolePermissions, Permission } from '../types';

const STORAGE_KEY_USERS = 'app_users';
const STORAGE_KEY_CURRENT_USER = 'app_current_user';

const MOCK_ADMIN: User = {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@scriptorium.dev',
    role: UserRole.Admin,
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
    preferences: {
        theme: 'dark',
        notifications: true
    },
    createdAt: new Date().toISOString()
};

export class UserService {
    private static users: User[] = [];

    static initialize() {
        const storedUsers = localStorage.getItem(STORAGE_KEY_USERS);
        if (storedUsers) {
            try {
                this.users = JSON.parse(storedUsers);
            } catch (e) {
                console.error('Failed to parse users from storage', e);
                this.users = [MOCK_ADMIN];
            }
        } else {
            this.users = [MOCK_ADMIN];
            this.saveUsers();
        }
    }

    private static saveUsers() {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.users));
    }

    static getUsers(): User[] {
        if (this.users.length === 0) {
            this.initialize();
        }
        return this.users;
    }

    static getUserById(id: string): User | undefined {
        return this.getUsers().find(u => u.id === id);
    }

    static saveUser(user: User): void {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index >= 0) {
            this.users[index] = user;
        } else {
            this.users.push(user);
        }
        this.saveUsers();

        // Update current user session if it matches
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === user.id) {
            localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
        }
    }

    static deleteUser(id: string): void {
        this.users = this.users.filter(u => u.id !== id);
        this.saveUsers();
    }

    static getCurrentUser(): User {
        const stored = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn('Invalid current user session', e);
            }
        }
        // Default to first user/admin if no session or invalid
        const defaultUser = this.getUsers()[0];
        this.setCurrentUser(defaultUser);
        return defaultUser;
    }

    static setCurrentUser(user: User): void {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    }

    static hasPermission(user: User, permission: Permission): boolean {
        const permissions = RolePermissions[user.role] || [];
        return permissions.includes(permission);
    }
}
