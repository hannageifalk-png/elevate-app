# Elevate 🏋️
Elevate är en webbaserad träningsapplikation där användare kan skapa och följa träningsprogram, hantera övningar och få tillgång till olika funktioner beroende på medlemsnivå.
Projektet är utvecklat som ett grupparbete inom utbildningen **Fullstack Developer** och innehåller frontend, backend, autentisering, databas och ett REST API.

## Funktioner
- Registrering och inloggning
- Autentisering och skyddade routes
- Användarprofiler
- Tre medlemsnivåer: Gratis, Standard och Premium
- Val och uppgradering av medlemskap
- Mockad betalningsprocess
- Kvitton för genomförda köp
- Träningsprogram och träningspass
- Övningsbibliotek
- Träningsstatistik
- Adminpanel för hantering av program och övningar
- Behörighetsstyrning baserat på användarroll och medlemsnivå

## Tech Stack
### Frontend
- React
- TypeScript
- Vite
- React Router
- CSS

### Backend
- Node.js
- Express
- TypeScript
- REST API

### Databas & Authentication
- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security (RLS)

### Deployment
- Vercel – frontend
- Render – backend
- Supabase – databas och autentisering

### Versionshantering & samarbete
- Git
- GitHub
- Feature branches
- Pull Requests
- Scrum

## Projektstruktur
Projektet är uppdelat i en frontend och en backend.
```text
elevate-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── ...
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── ...
│   └── package.json
│
└── README.md
```

## Medlemsnivåer
Elevate använder tre olika medlemsnivåer.

### Gratis
- Grundläggande funktionalitet
- Möjlighet att skapa egna träningsprogram

### Standard
- Tillgång till färdiga träningsprogram
- Utökade träningsfunktioner
- Tillgång till träningsstatistik

### Premium
- Tillgång till fler träningsprogram
- Utökad statistik
- Full tillgång till premiumfunktioner

## Installation
Klona projektet:
```bash
git clone <repository-url>
cd elevate-app
```

### Frontend
Navigera till frontend-mappen och installera dependencies:
```bash
cd frontend
npm install
npm run dev
```

### Backend
Navigera till backend-mappen och installera dependencies:
```bash
cd backend
npm install
npm run dev
```

## Environment Variables
Projektet använder environment variables för bland annat Supabase och kommunikationen mellan frontend och backend.
Exempel på variabler som används i frontend:
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
```
Backend använder separata miljövariabler för bland annat Supabase och serverkonfiguration.
Känsliga uppgifter och API-nycklar ska aldrig läggas direkt i repositoryt. Environment-filer som `.env` ska därför finnas med i `.gitignore`.

## Databas
Databasen är byggd med PostgreSQL via Supabase.
Några av de centrala tabellerna i projektet är:
- `app_user`
- `purchase`
- `program`
- `program_week`
- `program_day`
Databasen innehåller relationer mellan bland annat användare, medlemsnivåer, köp och träningsprogram.
Row Level Security (RLS) används för att styra vilken information användare får läsa och ändra.

## API
Frontend kommunicerar med backend genom ett REST API.
Backend ansvarar bland annat för att hantera data kopplad till träningsprogram, övningar och andra delar av applikationen.
I produktion kommunicerar den deployade frontend-applikationen på Vercel med backend som är deployad på Render.

## Autentisering
Autentisering hanteras med Supabase Authentication.
När en användare registrerar sig skapas ett konto som sedan kopplas till användarens profil i applikationen.
Applikationen använder även skyddade routes för sidor som kräver att användaren är inloggad.

## Admin
Applikationen innehåller en adminpanel där administratörer kan hantera innehåll i systemet.
Adminpanelen används bland annat för att hantera:
- Övningar
- Träningsprogram
- Innehåll som användare får tillgång till
Administratörsfunktionerna är separerade från vanliga användarfunktioner genom rollbaserad behörighet.

## Utvecklingsmetod
Projektet utvecklas i en grupp på tre personer med ett Scrum-inspirerat arbetssätt.
Vi använder Git och GitHub för versionshantering och samarbete.
Arbetsflödet består huvudsakligen av:
1. Skapa en issue/task
2. Skapa en feature branch
3. Utveckla funktionen
4. Commit och push till GitHub
5. Skapa Pull Request
6. Code review
7. Merge till `main`
Detta gör att gruppmedlemmarna kan arbeta parallellt med olika delar av applikationen utan att direkt påverka huvudversionen.

## Team
Projektet är utvecklat av tre studerande inom utbildningen **Fullstack Developer**.

## Status
🚧 Projektet är under aktiv utveckling.