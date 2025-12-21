import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'Arquitectura' | 'Backend' | 'DevOps';
  level: 'Intermedio' | 'Avanzado';
  content: string;
}

const tutorials: Tutorial[] = [
  {
    id: 'arch-1',
    title: 'Arquitectura Híbrida: React Dashboard + Astro Viewer',
    description: 'Entiende cómo separar el CMS (Este Dashboard) del Visor Público (Astro) usando una base de datos compartida.',
    category: 'Arquitectura',
    level: 'Intermedio',
    content: `
# Arquitectura del Sistema

Este proyecto utiliza un enfoque de **CMS Desacoplado (Headless-ish)** para Presuposicionalismo.com.

### Los Componentes

1.  **Dashboard (React SPA):**
    *   Es la aplicación donde estás ahora (Presuposicionalismo Dashboard).
    *   **Rol:** Editor, gestión de contenido, herramientas de IA y seguimiento de tareas.
    *   **Salida:** No genera HTML estático. Escribe datos JSON/Markdown en la base de datos (LibSQL).

2.  **Base de Datos (LibSQL / Turso):**
    *   **Rol:** La "verdad única" de los datos.
    *   **Características:** Rápida, soporta Búsqueda Vectorial (para IA) y funciona perfectamente en el borde.
    *   **Sync:** El Dashboard hace \`INSERT\` y Astro hace \`SELECT\`.

3.  **Frontend Público (Astro):**
    *   **Rol:** El sitio web que ven los usuarios finales.
    *   **Rendering:** Server-Side Rendering (SSR) o Híbrido.
    *   **Conexión:** Al momento de construir (build) o solicitar (request), Astro consulta LibSQL para obtener el contenido creado aquí.

### Flujo de Datos

\`\`\`mermaid
graph LR
    A[Usuario Editor] -->|Escribe| B(Presup. Dashboard)
    B -->|INSERT| C[(LibSQL Database)]
    D[Usuario Final] -->|Visita| E(Astro Website)
    E -->|SELECT| C
\`\`\`

Esta separación permite que tu Dashboard sea una aplicación compleja rica en interactividad, mientras que tu sitio público sigue siendo extremadamente rápido y optimizado para SEO gracias a Astro.
`
  },
  {
    id: 'db-1',
    title: 'Configuración de LibSQL con Vectores',
    description: 'Schema SQL necesario y cómo habilitar la búsqueda semántica.',
    category: 'Backend',
    level: 'Avanzado',
    content: `
# Configuración de Base de Datos

Para que este Dashboard funcione correctamente con búsqueda semántica, necesitas una instancia de LibSQL (puedes usar Turso.tech).

### 1. Schema SQL

Ejecuta este SQL en tu base de datos para crear la tabla de posts compatible con los vectores de Gemini (768 dimensiones).

\`\`\`sql
-- Habilitar extensión vectorial si es necesario (depende del proveedor)
-- CREATE EXTENSION vector;

CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft' | 'published'
  author TEXT,
  tags TEXT, -- JSON Array almacenado como texto
  embedding F32_BLOB(768), -- Vector Embedding para Gemini Pro/Flash
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índice vectorial para búsqueda rápida
CREATE INDEX post_embedding_idx ON posts (libsql_vector_idx(embedding));
\`\`\`

### 2. Cliente JS (\`@libsql/client\`)

En tu código (ya implementado en \`services/db.ts\`), la conexión se ve así:

\`\`\`typescript
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.LIBSQL_URL,
  authToken: process.env.LIBSQL_AUTH_TOKEN,
});
\`\`\`

### 3. Generación de Embeddings

Cuando guardas un post, debes generar el embedding del texto usando Gemini API y guardarlo en la columna \`embedding\`.

\`\`\`typescript
const embeddingModel = ai.getGenerativeModel({ model: "embedding-001" });
const result = await embeddingModel.embedContent(inputText);
const vector = result.embedding.values;

// Guardar 'vector' en la columna 'embedding'
\`\`\`
`
  },
  {
    id: 'devops-1',
    title: 'Despliegue en VPS con Docker Compose',
    description: 'Orquesta el Dashboard y el Blog en un solo servidor usando contenedores.',
    category: 'DevOps',
    level: 'Intermedio',
    content: `
# Despliegue en Producción (VPS)

Para desplegar esto en un VPS (DigitalOcean, Hetzner, AWS), usaremos Docker Compose.

### Estructura de Carpetas

\`\`\`text
/mi-proyecto
  /dashboard (Este repo React)
  /astro-blog (Tu repo Astro)
  docker-compose.yml
\`\`\`

### docker-compose.yml

\`\`\`yaml
version: '3.8'

services:
  # 1. El Dashboard (React)
  dashboard:
    build: ./dashboard
    ports:
      - "3000:80"
    environment:
      - LIBSQL_URL=libsql://...
      - LIBSQL_AUTH_TOKEN=...
      - API_KEY=...
    restart: always

  # 2. El Blog Público (Astro SSR)
  astro-blog:
    build: ./astro-blog
    ports:
      - "4321:4321"
    environment:
      - LIBSQL_URL=libsql://...
      - LIBSQL_AUTH_TOKEN=...
      - HOST=0.0.0.0
    restart: always
\`\`\`

### Dockerfile (Dashboard)

Usaremos Nginx para servir la aplicación estática de React.

\`\`\`dockerfile
# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Configuración opcional de Nginx para React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

### Despliegue

1. Accede a tu VPS vía SSH.
2. Clona tu repo.
3. Ejecuta:
   \`docker-compose up -d --build\`
`
  }
];

const TutorialsView = () => {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

  return (
    <div className="flex-1 h-screen bg-[#fafafa] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-white border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tutoriales de Implementación</h1>
                <p className="text-sm text-gray-500">Guías técnicas para desplegar la arquitectura Presuposicionalismo.com.</p>
            </div>
            {selectedTutorial && (
                <button 
                    onClick={() => setSelectedTutorial(null)}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Volver a la lista
                </button>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
            
            {/* List View */}
            <div className={`flex-1 p-8 overflow-y-auto custom-scrollbar transition-all duration-300 ${selectedTutorial ? 'hidden md:flex md:w-1/3 md:flex-none border-r border-gray-200 bg-white' : 'w-full'}`}>
                <div className="w-full grid gap-4 max-w-4xl mx-auto md:max-w-none">
                    {tutorials.map(tutorial => (
                        <div 
                            key={tutorial.id} 
                            onClick={() => setSelectedTutorial(tutorial)}
                            className={`group p-6 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3
                                ${selectedTutorial?.id === tutorial.id 
                                    ? 'bg-black text-white border-black shadow-lg' 
                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider 
                                    ${selectedTutorial?.id === tutorial.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {tutorial.category}
                                </span>
                                <span className={`text-xs font-medium ${selectedTutorial?.id === tutorial.id ? 'text-gray-300' : 'text-gray-400'}`}>
                                    {tutorial.level}
                                </span>
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg mb-1 ${selectedTutorial?.id === tutorial.id ? 'text-white' : 'text-gray-900'}`}>
                                    {tutorial.title}
                                </h3>
                                <p className={`text-sm leading-relaxed ${selectedTutorial?.id === tutorial.id ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {tutorial.description}
                                </p>
                            </div>
                            <div className={`mt-2 flex items-center gap-2 text-xs font-bold ${selectedTutorial?.id === tutorial.id ? 'text-blue-300' : 'text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                                Leer guía <span aria-hidden="true">→</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail View */}
            {selectedTutorial ? (
                <div className="flex-[2] bg-white p-8 md:p-12 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 duration-300">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-8 pb-8 border-b border-gray-100">
                            <span className="text-blue-600 font-bold tracking-wider text-xs uppercase mb-2 block">{selectedTutorial.category}</span>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{selectedTutorial.title}</h1>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    10 min lectura
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>Actualizado hoy</span>
                            </div>
                        </div>
                        <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg">
                            <ReactMarkdown>{selectedTutorial.content}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-[2] items-center justify-center bg-gray-50 text-center p-8">
                    <div className="max-w-md">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Selecciona un tutorial</h3>
                        <p className="text-gray-500 text-sm">Elige una guía de la lista para ver los detalles de implementación paso a paso.</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default TutorialsView;