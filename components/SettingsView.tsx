import React, { useState, useEffect } from 'react';
import { User, UserRole, RolePermissions, Permission } from '../types';
import { UserService } from '../services/userService';

const Avatar = ({ name, url, size = 'md' }: { name: string, url?: string, size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-20 h-20 text-xl',
        xl: 'w-32 h-32 text-2xl'
    };

    return (
        <div className={`${sizeClasses[size]} rounded-full border-2 border-border overflow-hidden flex items-center justify-center bg-secondary text-secondary-foreground font-bold`}>
            {url ? (
                <img src={url} alt={name} className="w-full h-full object-cover" />
            ) : (
                <span>{name.charAt(0).toUpperCase()}</span>
            )}
        </div>
    );
};

export default function SettingsView() {
    const [activeTab, setActiveTab] = useState<'profile' | 'team'>('profile');
    const [currentUser, setCurrentUser] = useState<User>(UserService.getCurrentUser());
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Profile Form State
    const [profileName, setProfileName] = useState(currentUser.name);
    const [profileEmail, setProfileEmail] = useState(currentUser.email);
    const [profileAvatar, setProfileAvatar] = useState(currentUser.avatar || '');
    const [geminiApiKey, setGeminiApiKey] = useState(currentUser.preferences?.geminiApiKey || '');

    useEffect(() => {
        setUsers(UserService.getUsers());
    }, []);

    const handleSaveProfile = () => {
        const updatedUser = {
            ...currentUser,
            name: profileName,
            email: profileEmail,
            avatar: profileAvatar || undefined,
            preferences: {
                ...currentUser.preferences,
                geminiApiKey: geminiApiKey || undefined
            }
        };
        UserService.saveUser(updatedUser);
        setCurrentUser(updatedUser);
        setUsers(UserService.getUsers()); // Refresh list if changed
        alert('Perfil actualizado con éxito');
    };

    const handleAddUser = () => {
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: 'Nuevo Usuario',
            email: 'usuario@ejemplo.com',
            role: UserRole.Member,
            createdAt: new Date().toISOString()
        };
        UserService.saveUser(newUser);
        setUsers(UserService.getUsers());
        setEditingUser(newUser);
    };

    const handleDeleteUser = (id: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            UserService.deleteUser(id);
            setUsers(UserService.getUsers());
        }
    };

    const handleUpdateUser = (user: User) => {
        UserService.saveUser(user);
        setUsers(UserService.getUsers());
        setEditingUser(null);
    };

    return (
        <div className="h-full flex flex-col bg-background text-foreground animate-fadeIn p-8 overflow-y-auto">
            <h1 className="text-3xl font-bold mb-2">Configuración</h1>
            <p className="text-muted-foreground mb-8">Gestiona tu perfil y los miembros del equipo.</p>

            {/* Tabs */}
            <div className="flex border-b border-border mb-8">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Mi Perfil
                </button>
                {currentUser.role === UserRole.Admin && (
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'team' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Gestión de Equipo
                    </button>
                )}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="max-w-xl space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar name={profileName} url={profileAvatar} size="xl" />
                        <div className="flex-1 space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">URL del Avatar</label>
                            <input
                                type="text"
                                value={profileAvatar}
                                onChange={(e) => setProfileAvatar(e.target.value)}
                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre Completo</label>
                            <input
                                type="text"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                            <input
                                type="email"
                                value={profileEmail}
                                onChange={(e) => setProfileEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Rol</label>
                            <div className="w-full px-3 py-2 bg-secondary/20 border border-border rounded-lg opacity-70">
                                {currentUser.role}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Gemini API Key</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={geminiApiKey}
                                    onChange={(e) => setGeminiApiKey(e.target.value)}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                                    placeholder="Pegar API Key aquí..."
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Tu clave se guarda localmente y se usa para conectar con Scriptorium AI.</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Guardar Cambios
                    </button>
                </div>
            )
            }

            {/* Team Tab */}
            {
                activeTab === 'team' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Usuarios del Sistema</h2>
                            <button
                                onClick={handleAddUser}
                                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Agregar Usuario
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {users.map(user => (
                                <div key={user.id} className="p-4 bg-secondary/30 border border-border rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar name={user.name} url={user.avatar} size="md" />
                                        <div>
                                            {editingUser?.id === user.id ? (
                                                <div className="flex gap-2 mb-1">
                                                    <input
                                                        value={editingUser.name}
                                                        onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                                        className="px-2 py-1 text-sm bg-background border border-border rounded"
                                                    />
                                                    <input
                                                        value={editingUser.email}
                                                        onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                                                        className="px-2 py-1 text-sm bg-background border border-border rounded"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="font-medium">{user.name} {currentUser.id === user.id && <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-2">Tú</span>}</h3>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {editingUser?.id === user.id ? (
                                            <select
                                            <div>
                                                <select
                                                    value={editingUser.role}
                                                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                                                    className="px-2 py-1 text-sm bg-background border border-border rounded"
                                                >
                                                    {Object.values(UserRole).map(role => (
                                                        <option key={role} value={role}>{role}</option>
                                                    ))}
                                                </select>
                                                <div className="mt-2 text-xs text-muted-foreground max-w-[200px]">
                                                    Permisos: {RolePermissions[editingUser.role].map(p => p.split('_').join(' ')).join(', ')}
                                                </div>
                                            </div>
                                    ) : (
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.role === UserRole.Admin ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                        {user.role}
                                    </span>
                                        )}

                                    <div className="flex items-center gap-2">
                                        {editingUser?.id === user.id ? (
                                            <>
                                                <button onClick={() => handleUpdateUser(editingUser)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button>
                                                <button onClick={() => setEditingUser(null)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => setEditingUser(user)} className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                                {currentUser.id !== user.id && (
                                                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                </div>
                            ))}
                    </div>
                    </div>
    )
}
        </div >
    );
}
