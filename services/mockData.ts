
// --- Types ---

export type FeatureType = 'Epic' | 'Feature' | 'Task';
export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'Todo' | 'InProgress' | 'Done' | 'Backlog' | 'Review';
export type ProjectStatus = 'On Track' | 'At Risk' | 'Delayed' | 'Completed' | 'Not Started';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role?: 'Admin' | 'Member';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  tags: string[];
  assigneeId: string | null;
  reminder?: string; // New field for notifications (e.g., '1h', '24h')
}

export interface ProjectSummary {
  id: string;
  title: string;
  category: string;
  progress: number;
  status: ProjectStatus;
  dueDate: string;
  members: string[];
  description: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  startDate: string; 
  endDate: string;   
  type: 'project' | 'task' | 'meeting' | 'milestone';
  row: number; 
  status: 'draft' | 'active' | 'done';
  avatars: string[];
}

export interface Note {
    id: string;
    title: string;
    content: string;
    color: 'yellow' | 'blue' | 'green' | 'pink' | 'white';
    relatedTo?: {
        type: 'project' | 'task';
        id: string;
        name: string;
    };
    updatedAt: Date;
}

// --- Data ---

export const TEAM_MEMBERS: User[] = [
  { id: 'u1', name: 'Ana (Lead)', role: 'Admin', avatar: 'https://picsum.photos/id/101/100/100' },
  { id: 'u2', name: 'Carlos', role: 'Member', avatar: 'https://picsum.photos/id/102/100/100' },
  { id: 'u3', name: 'Elena', role: 'Member', avatar: 'https://picsum.photos/id/103/100/100' },
  { id: 'u4', name: 'David', role: 'Member', avatar: 'https://picsum.photos/id/104/100/100' },
  { id: 'u5', name: 'Sofia', role: 'Member', avatar: 'https://picsum.photos/id/105/100/100' },
];

export const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Revisar traducción del capítulo 1', status: 'Todo', priority: 'High', dueDate: '2026-02-04', tags: ['Traducción'], assigneeId: 'u2', reminder: '24h' },
  { id: '2', title: 'Enviar email semanal', status: 'Done', priority: 'Medium', dueDate: '2026-02-03', tags: ['Marketing'], assigneeId: 'u5' },
  { id: '3', title: 'Diseñar portada del libro', status: 'InProgress', priority: 'High', dueDate: '2026-02-06', tags: ['Diseño'], assigneeId: 'u3', reminder: '1h' },
  { id: '4', title: 'Actualizar referencias bibliográficas', status: 'Todo', priority: 'Low', dueDate: '2026-02-10', tags: ['Edición'], assigneeId: 'u4' },
  { id: '5', title: 'Preparar presentación para conferencia', status: 'InProgress', priority: 'Medium', dueDate: '2026-02-05', tags: ['Evento'], assigneeId: 'u1' },
];

export const PROJECT_LIST: ProjectSummary[] = [
    {
        id: '1', title: 'Documento sobre la Evolución', category: 'Ciencia Q1', progress: 85, status: 'On Track', dueDate: 'Feb 2026',
        members: ['https://picsum.photos/id/101/40/40'],
        description: 'Crítica a la neutralidad en la ciencia. Reactivación del sitio con contenido polémico.'
    },
    {
        id: '2', title: 'Warfield: Tertuliano y Agustín', category: 'Historia Q2', progress: 40, status: 'Delayed', dueDate: 'May 2026',
        members: ['https://picsum.photos/id/104/40/40', 'https://picsum.photos/id/105/40/40'],
        description: 'Epistemología histórica. Conectar el presuposicionalismo con la historia de la iglesia.'
    },
    {
        id: '3', title: 'Compilaciones de Greg Bahnsen', category: 'Apologética Q3', progress: 15, status: 'On Track', dueDate: 'Ago-Oct 2026',
        members: ['https://picsum.photos/id/102/40/40'],
        description: 'El núcleo duro. Traducción intensiva de dos volúmenes principales.'
    },
    {
        id: '4', title: 'Breve Introducción a la Filosofía', category: 'Educación Q4', progress: 0, status: 'Not Started', dueDate: 'Dic 2026',
        members: ['https://picsum.photos/id/103/40/40'],
        description: 'Serie de artículos (Metafísica, Epistemología, Ética) compilados en un PDF final.'
    },
];

export const MOCK_DB: Record<string, TimelineItem[]> = {
    '1': [ // Evolución (Q1)
        { id: '1', title: 'Revisión final de estilo', subtitle: 'Ene 05 - Ene 20', startDate: '2026-01-05', endDate: '2026-01-20', type: 'task', row: 0, status: 'active', avatars: ['https://picsum.photos/id/101/40/40'] },
        { id: '2', title: 'Diseño Portada y Gráficos', subtitle: 'Ene 20 - Ene 30', startDate: '2026-01-20', endDate: '2026-01-30', type: 'task', row: 1, status: 'draft', avatars: ['https://picsum.photos/id/108/40/40'] },
        { id: '3', title: 'PUBLICACIÓN: Art. Evolución', subtitle: 'Feb 15', startDate: '2026-02-15', endDate: '2026-02-15', type: 'milestone', row: 0, status: 'draft', avatars: [] },
        { id: '4', title: 'Campaña Redes (Clips/Citas)', subtitle: 'Mar 01 - Mar 15', startDate: '2026-03-01', endDate: '2026-03-15', type: 'task', row: 2, status: 'draft', avatars: [] },
    ],
    '2': [ // Warfield (Q2)
        { id: '1', title: 'Revisión Traducción', subtitle: 'Feb 15 - Mar 30', startDate: '2026-02-15', endDate: '2026-03-30', type: 'project', row: 0, status: 'active', avatars: ['https://picsum.photos/id/104/40/40'] },
        { id: '2', title: 'Maquetación y Notas', subtitle: 'Abr 01 - Abr 20', startDate: '2026-04-01', endDate: '2026-04-20', type: 'task', row: 1, status: 'draft', avatars: [] },
        { id: '3', title: 'PUBLICACIÓN: Warfield', subtitle: 'May 10', startDate: '2026-05-10', endDate: '2026-05-10', type: 'milestone', row: 0, status: 'draft', avatars: [] },
    ],
    '3': [ // Bahnsen (Q3)
        { id: '1', title: 'Traducción Vol. 1', subtitle: 'Abr 15 - Jul 15', startDate: '2026-04-15', endDate: '2026-07-15', type: 'project', row: 0, status: 'active', avatars: ['https://picsum.photos/id/102/40/40'] },
        { id: '2', title: 'Inicio Traducción Vol. 2', subtitle: 'Jul 01 - Sep 30', startDate: '2026-07-01', endDate: '2026-09-30', type: 'project', row: 1, status: 'draft', avatars: [] },
        { id: '3', title: 'PUB: Bahnsen Vol. 1', subtitle: 'Ago 20', startDate: '2026-08-20', endDate: '2026-08-20', type: 'milestone', row: 0, status: 'draft', avatars: [] },
        { id: '4', title: 'PUB: Bahnsen Vol. 2', subtitle: 'Oct 15', startDate: '2026-10-15', endDate: '2026-10-15', type: 'milestone', row: 1, status: 'draft', avatars: [] },
    ],
    '4': [ // Filosofía (Q4)
        { id: '1', title: 'Bosquejo Temario', subtitle: 'May 01 - May 10', startDate: '2026-05-01', endDate: '2026-05-10', type: 'task', row: 2, status: 'draft', avatars: [] },
        { id: '2', title: 'Redacción Cap 1 (Metafísica)', subtitle: 'Jun 01 - Jun 30', startDate: '2026-06-01', endDate: '2026-06-30', type: 'project', row: 3, status: 'draft', avatars: [] },
        { id: '3', title: 'Redacción Cap 2 (Epistemología)', subtitle: 'Ago 01 - Ago 30', startDate: '2026-08-01', endDate: '2026-08-30', type: 'project', row: 3, status: 'draft', avatars: [] },
        { id: '4', title: 'Redacción Cap 3 (Ética)', subtitle: 'Oct 01 - Oct 30', startDate: '2026-10-01', endDate: '2026-10-30', type: 'project', row: 3, status: 'draft', avatars: [] },
        { id: '5', title: 'LANZAMIENTO: Intro Filosofía', subtitle: 'Dic 10', startDate: '2026-12-10', endDate: '2026-12-10', type: 'milestone', row: 2, status: 'draft', avatars: [] },
    ]
};

export const INITIAL_NOTES: Note[] = [
    {
        id: 'n1',
        title: 'Ideas para Intro',
        content: 'Considerar usar la analogía del "mapa y el territorio" para explicar la cosmovisión.',
        color: 'yellow',
        updatedAt: new Date(),
        relatedTo: { type: 'project', id: '4', name: 'Intro a la Filosofía' }
    },
    {
        id: 'n2',
        title: 'Contacto Editorial',
        content: 'Llamar a Juan el martes para revisar el contrato de los derechos de Bahnsen.',
        color: 'blue',
        updatedAt: new Date(Date.now() - 86400000),
        relatedTo: { type: 'project', id: '3', name: 'Bahnsen Compilations' }
    },
    {
        id: 'n3',
        title: 'Estilo Gráfico',
        content: 'Usar tonos tierra y tipografía serif para la sección de Historia.',
        color: 'pink',
        updatedAt: new Date(Date.now() - 172800000),
        relatedTo: { type: 'task', id: '3', name: 'Diseñar portada' }
    }
];
