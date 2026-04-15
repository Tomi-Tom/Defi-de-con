<div align="center">

# 🔥 DEFI DE CON

<img src="https://img.shields.io/badge/SAISON%201-OUVERTE-00ff87?style=for-the-badge&labelColor=0a0a0a" alt="Saison 1"/>

### *Releve des defis. Suis tes progres. Deviens inarretable.*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

**Defi De Con** est une plateforme de suivi de defis gamifiee, pensee pour un groupe d'amis qui veulent se depasser ensemble. Creez des defis personnalises, saisissez vos donnees quotidiennement, grimpez dans les classements et debloquez des badges — le tout dans une interface dark mode elegante aux couleurs neon.

*Gratuit. Sans pub. 100% motivation.*

</div>

---

## 📸 Captures d'ecran

> *Section a venir — les captures seront ajoutees prochainement.*

<div align="center">

| Dashboard | Defis | Profil |
|:---------:|:-----:|:------:|
| ![Dashboard](https://via.placeholder.com/300x200/0a0a0a/00ff87?text=Dashboard) | ![Defis](https://via.placeholder.com/300x200/0a0a0a/ff6b00?text=Defis) | ![Profil](https://via.placeholder.com/300x200/0a0a0a/00ff87?text=Profil) |

</div>

---

## ✨ Fonctionnalites

### 🏋️ Defis sur mesure
- **Champs dynamiques** — chaque defi definit ses propres champs de saisie (nombre, duree, texte, date, booleen, fichier, image)
- **Objectifs progressifs** — des cibles par date permettent de visualiser sa progression
- **Cycle de vie complet** — brouillon → actif → termine, avec transition automatique via cron

### 🎮 Gamification complete
- **Systeme de points** — points pour chaque saisie quotidienne, streaks, et bonus
- **Badges deblocables** — streak, completion, podium, et badges custom
- **Classements** — compare-toi aux autres participants en temps reel
- **Streaks** — maintiens ta serie quotidienne, avec alertes quand elle est en danger

### 📊 Dashboard riche
- **Graphique d'activite** sur 14 jours avec Recharts
- **Resume hebdomadaire** — comparaison semaine en cours vs semaine precedente
- **Widgets modulaires** — streak, points, taux de completion, derniere saisie, badges recents
- **Citations motivantes** — une quote selectionnee chaque jour pour garder le cap
- **Confettis** 🎉 a la saisie (canvas-confetti)

### 👤 Profil & personnalisation
- **Avatar** avec upload sur Supabase Storage
- **Mode de saisie** au choix : rapide ou wizard (un champ a la fois)
- **Historique** de tous les defis rejoints
- **Profils publics** consultables par les autres utilisateurs

### 🛡️ Panel administrateur
- **Gestion des defis** — creer, editer, dupliquer, publier, supprimer
- **Gestion des utilisateurs** — vue d'ensemble de tous les profils
- **Gestion des badges** — creation et configuration des conditions d'obtention
- **Gestion des citations** — ajout et categorisation (daily, streak_lost, rank_up, etc.)
- **Ajustements** — modifier manuellement les valeurs d'un participant
- **Export Excel** via la librairie `xlsx`

---

## 🛠️ Stack technique

<div align="center">

| Couche | Technologie |
|--------|-------------|
| **Framework** | Next.js 16 (App Router, Server Components, Server Actions) |
| **UI** | React 19 · Tailwind CSS 4 · Lucide Icons |
| **Backend / BDD** | Supabase (PostgreSQL, Auth, Storage, RLS) |
| **Validation** | Zod 4 · React Hook Form |
| **Graphiques** | Recharts |
| **Animations** | CSS custom (fade, slide, glow, confetti) |
| **Notifications** | Sonner (toasts dark mode) |
| **Dates** | date-fns (avec locale `fr`) |
| **Deploiement** | Vercel (avec cron job quotidien a 01h00) |
| **Package manager** | pnpm |

</div>

---

## 🚀 Installation

### Pre-requis

- **Node.js** >= 18
- **pnpm** >= 8
- Un projet **Supabase** (gratuit sur [supabase.com](https://supabase.com))

### 1. Cloner le projet

```bash
git clone https://github.com/Tomi-Tom/defi_de_con.git
cd defi_de_con
```

### 2. Installer les dependances

```bash
pnpm install
```

### 3. Configurer les variables d'environnement

Creer un fichier `.env.local` a la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
CRON_SECRET=un_secret_pour_le_cron
```

### 4. Appliquer les migrations Supabase

```bash
pnpm supabase db push
```

### 5. Lancer le serveur de developpement

```bash
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

---

## 📁 Structure du projet

```
defi_de_con/
├── app/
│   ├── (public)/              # Pages publiques (landing, login, signup)
│   ├── (app)/                 # Pages authentifiees
│   │   ├── dashboard/         #   Dashboard principal
│   │   ├── challenges/        #   Liste, detail, saisie, historique
│   │   └── profile/           #   Profil, badges, profil public
│   ├── (admin)/               # Panel d'administration
│   │   └── admin/             #   Defis, utilisateurs, badges, citations
│   ├── api/cron/              # Cron job (transition auto des defis)
│   ├── layout.tsx             # Layout racine (Inter font, Toaster)
│   └── globals.css            # Theme dark mode, animations custom
├── components/
│   ├── ui/                    # Composants generiques (Button, Card, Input...)
│   ├── layout/                # Sidebar, Topbar, MobileNav
│   ├── dashboard/             # Widgets du dashboard
│   ├── challenges/            # Cartes de defis
│   ├── profile/               # Hero du profil, avatar
│   └── auth/                  # Formulaires d'authentification
├── lib/
│   ├── supabase/              # Clients Supabase (server, client, admin, middleware)
│   ├── actions/               # Server Actions (auth, entries, challenges, points...)
│   ├── validations/           # Schemas Zod
│   └── utils/                 # Utilitaires (dates, points, quotes)
├── types/
│   └── database.ts            # Types TypeScript du schema Supabase
├── supabase/
│   └── migrations/            # 8 fichiers de migration SQL
├── public/
│   └── badges/                # Icones de badges
└── vercel.json                # Configuration cron Vercel
```

---

## ⚙️ Scripts disponibles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Lance le serveur de developpement |
| `pnpm build` | Build de production |
| `pnpm start` | Lance le serveur de production |
| `pnpm lint` | Analyse ESLint du code |

---

## 🎨 Design

L'interface adopte un design **dark mode brutal** inspire de l'univers fitness/gaming :

- **Fond** : noir profond `#0a0a0a` avec gradients subtils
- **Accent principal** : vert neon `#00ff87`
- **Accent secondaire** : orange vif `#ff6b00`
- **Typographie** : Inter (bold/black) avec tracking serre
- **Animations** : fade-in, slide-up, glow pulses, badge unlock, confetti
- **Responsive** : navigation mobile avec bottom bar

---

## 👨‍💻 Auteur

<div align="center">

Cree avec ❤️ et determination par

### **Tomi-Tom**

[![GitHub](https://img.shields.io/badge/GitHub-Tomi--Tom-181717?style=for-the-badge&logo=github)](https://github.com/Tomi-Tom)

</div>

---

## 📄 Licence

Ce projet est un projet personnel. Tous droits reserves.

---

<div align="center">

**Chaque jour compte. Chaque effort est recompense.**

🔥 *Rejoins le combat.* 🔥

</div>
