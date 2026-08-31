# Figgy Stacked

**Real-time, consent-based group payments.** Everyone approves their share before a single cent moves.

Figgy Stacked is a mobile-first prototype that replaces the "one person fronts the bill and chases everyone else for weeks" ritual with a live group payment session. A group is created for a bill, members join by code, and each person approves their split in real time. Only once *every* member has approved does the app generate a one-time-use virtual card to settle the transaction.

Built as the final project for Northeastern's Full Stack Software Engineering course by a team of five.

---

## Table of Contents

- [The Problem](#the-problem)
- [How It Works](#how-it-works)
- [Features](#features)
- [Demo & Design Artifacts](#demo--design-artifacts)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Data Model](#data-model)
- [REST API](#rest-api)
- [Real-Time Events](#real-time-events)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Technical Challenges](#technical-challenges)
- [Reflection](#reflection)
- [Roadmap](#roadmap)
- [Team](#team)

---

## The Problem

Splitting a bill among friends — at a restaurant, on a trip, for a shared subscription — usually means one person pays up front and everyone else pays them back later. That model breaks down in familiar ways:

- The person fronting the bill needs the balance, credit limit, or nerve to cover the whole thing.
- Repayment depends on everyone *remembering* to send their share promptly.
- When they don't, the person who paid is stuck awkwardly asking for money.

**Figgy Stacked flips the order of operations.** Consent and payment happen *before* the transaction is processed, not after. Nobody is left holding the bill.

## How It Works

```
Group creator                          Group members
──────────────                         ─────────────
Enter name                             Enter name
   │                                       │
Create group + bill amount             Join group with code
   │                                       │
   └──────────────┬────────────────────────┘
                  ▼
        Live group session (WebSocket room)
        • Everyone sees the member list and per-person split update live
        • Each member toggles "Approve" for their share
        • Any change to the bill amount resets all approvals
                  │
      All members approved?
                  │ yes
                  ▼
     Creator proceeds to payment
                  │
     Backend generates a one-time-use virtual card
                  │
     Payment processed → card marked used → group archived
                  │
     "Payment Complete" broadcast to every member
```

## Features

- **Group creation & join-by-code** — create a session for a bill, share the numeric group code, members join instantly.
- **Live split calculation** — per-person amount is recomputed and pushed to every client as members join or leave.
- **Real-time consent** — each member approves their own share; the leader sees approvals land live and can only proceed once everyone is in.
- **Approval invalidation** — editing the bill total or changing group membership resets every approval, so nobody ever pays an amount they didn't see.
- **One-time-use virtual card** — on full consent the backend mints a single-use card (number, CVV, expiry) scoped to the group and exact amount, then marks it `used` after payment.
- **Automatic card expiry** — unused cards are expired after 24 hours by a periodic sweep.
- **Cross-platform** — runs on iOS, Android, and the web from one Expo/React Native codebase, with a persistence layer that abstracts over `AsyncStorage` (mobile) and `sessionStorage` (web).

## Demo & Design Artifacts

| Artifact | Link |
| --- | --- |
| Design Document | [Google Docs](https://docs.google.com/document/d/1PpczGhD2BrGPYyaZBqbDv7A2zLCBUmHDQxzDb5vE508/edit?usp=sharing) |
| Figma Wireframes | [Figma](https://www.figma.com/design/0bFHgHil8PQ0E7DZcFgkWh/CS-303---Full-Stack-Final-Proj?node-id=0-1&t=egGvOSDIOu4YYghn-1) |
| Final Presentation | [Google Slides](https://docs.google.com/presentation/d/1ZN3LoZzWopnZ3j8YOXac6ygJuQmU38EJztfppwJVwJo/edit?usp=sharing) |

PDF copies of the [design document](./Full%20Stack%20Final%20Design%20Doc.pdf) and [presentation](./Full%20Stack%20Final%20Presentation.pdf) are also checked into this folder.

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React Native · Expo · Expo Router (file-based routing) · TypeScript · React Context API |
| **Real-time** | Socket.IO client |
| **Backend** | Node.js · Express 5 · Socket.IO |
| **ORM / DB** | Sequelize · MySQL (AWS RDS) |
| **Storage (client)** | AsyncStorage (mobile) · sessionStorage (web) |

### Why these choices

- **React Native** — native look and feel, JavaScript/TypeScript across the whole team, a Virtual DOM rendering model we already knew from class, and the highest industry adoption of the frontend options we evaluated (vs. Flutter, Svelte, SolidJS).
- **Express** — fastest path to a working API, one language shared with the frontend, and deep integration with the Node ecosystem (vs. Rails, FastAPI, Flask).
- **Socket.IO over GraphQL subscriptions** — we wanted hands-on experience defining our own real-time event contract. In hindsight this was the most debatable call (see [Reflection](#reflection)).
- **MySQL over NoSQL** — our data (users, groups, cards) is structured and relational, with clear foreign-key relationships.

## Architecture

Figgy Stacked is a single application organized into clean horizontal layers, with the backend further split by responsibility (routes → controllers → models).

```
┌─────────────────────────────────────────────────────────────┐
│ Presentation      React Native screens · Context providers   │
├─────────────────────────────────────────────────────────────┤
│ Application        Socket client · fetch API calls · state   │
├─────────────────────────────────────────────────────────────┤
│ Business           Express controllers · Socket handlers     │
├─────────────────────────────────────────────────────────────┤
│ Data Access        Sequelize models · MySQL connection       │
└─────────────────────────────────────────────────────────────┘
```

**Design patterns in use**

- **MVC** — Sequelize models (`Group`, `User`, `NFCCard`), React screens as the view, Express route handlers as controllers.
- **Observer** — Socket.IO rooms; clients subscribe to a `group-<id>` room and receive `groupState` broadcasts whenever anything changes.
- **Singleton** — one global WebSocket connection owned by `GroupProvider`, so mobile and web never open duplicate sockets.
- **Provider / dependency injection** — `useUser` and `useGroup` hooks expose global state with no prop drilling.

**Coupling & cohesion**

- Each provider owns exactly one concern (identity vs. group membership + socket lifecycle).
- Socket broadcasting logic lives in one place (`broadcastGroupUpdate`).
- The `usePersistence` hook hides all mobile/web storage differences from the rest of the app.

### Real-time join & approval flow

```
Client ──── joinGroup(groupId, userId) ───────────▶ Server
Client ◀─── groupState (members, total, splits) ── Server   (broadcast to whole room)

Client ──── userApproval(groupId, userId, bool) ──▶ Server
                                                    │ dedupe within 1s
                                                    │ persist to DB
Client ◀─── groupState ──────────────────────────── Server   (broadcast to whole room)
Client ◀─── allApproved ─────────────────────────── Server   (if every member approved)

Client ◀─── paymentComplete (txn id, amount) ───── Server   (after card is charged)
```

## Repository Structure

```
Projects/FinalProject/
├── backend/
│   ├── app.js                    # Express + Socket.IO server, socket event handlers
│   ├── models/
│   │   ├── db.js                 # Sequelize connection
│   │   └── models.js             # Group, User, NFCCard models + associations
│   ├── controllers/
│   │   ├── groupController.js    # create/join/delete group, update total, broadcast
│   │   ├── userController.js     # create user, assign group, cleanup orphans
│   │   ├── nfcController.js      # virtual card generation, payment processing, expiry
│   │   └── paymentController.js  # payment method (mock tokenization), mock processing
│   └── routes/                   # /group, /user, /payment, /nfc route definitions
│
└── frontend/
    ├── app/                      # Expo Router screens
    │   ├── _layout.tsx           # font loading, provider tree, navigation stack
    │   ├── index.tsx             # name entry
    │   ├── join_create.tsx       # join by code or start a new group
    │   ├── bill.tsx              # enter bill amount (create flow)
    │   ├── group.tsx             # live group session — the core screen
    │   ├── add_payment.tsx       # add a card (mock)
    │   ├── payment_confirmation.tsx
    │   └── providers/            # UserProvider, GroupProvider
    ├── components/               # atoms / molecules / organisms
    ├── hooks/                    # usePersistence, useColorScheme, useThemeColor
    ├── constants/                # Colors, Typography, Layout
    ├── config/api.ts             # resolves backend URL from the Expo host IP
    ├── socket.js                 # Socket.IO client singleton
    └── DESIGN_SYSTEM.md          # color, typography, and component reference
```

## Data Model

```
Group (genGroup)                User                       NFCCard
───────────────                 ────                       ───────
groupID        PK               UID              PK        id             PK
adminID                         username                   nfcCardId      unique
group_name                      approval_status            groupID        FK → Group
total_amount                    groupID          FK        cardNumber
approval_status                                            cvv
status (active|                                            expiryDate
  completed|archived)                                      totalAmount
                                                           status (active|used|expired)
                                                           createdAt / usedAt
                                                           transactionId

Group 1 ──── n User      (ON DELETE SET NULL)
Group 1 ──── n NFCCard   (ON DELETE CASCADE)
```

## REST API

Base URL: `http://<host>:3001`

### Users

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/user/create` | Create a user by `username` (reuses an orphaned user with the same name). |
| `POST` | `/user/setGroup` | Assign a user to a group. |
| `POST` | `/user/cleanup` | Delete orphaned users (no group) older than one hour. |

### Groups

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/group/create` | Create a group with `amount` and `creatorId`. |
| `POST` | `/group/join` | Join a group with `newGroupID` and `userID`; resets all approvals. |
| `GET` | `/group/:groupId` | Fetch group details + members. |
| `PUT` | `/group/:groupId/total` | Update the bill total; resets all approvals and broadcasts. |
| `POST` | `/group/delete/:groupID` | Delete a group. |

### NFC / Virtual Card

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/nfc/generate` | Mint a one-time-use virtual card for `groupId` / `totalAmount`. |
| `POST` | `/nfc/process` | Charge the card, mark it `used`, archive the group, broadcast `paymentComplete`. |
| `GET` | `/nfc/status/:nfcCardId` | Check a card's status. |

### Payment methods (mock)

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/payment/method` | Add a card; mock-tokenized, brand detected from BIN. |
| `GET` | `/payment/method/:userId` | Get the user's active payment method. |
| `POST` | `/payment/process` | Mock-process a charge. |

### Utility

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness check. |
| `GET` | `/debug/rooms` | Inspect active Socket.IO group rooms. |

## Real-Time Events

**Client → Server**

| Event | Payload | Effect |
| --- | --- | --- |
| `joinGroup` | `{ groupId, userId }` | Joins the `group-<id>` room, broadcasts current `groupState`. |
| `userApproval` | `{ groupId, userId, approved }` | Persists approval (deduped within 1s), broadcasts `groupState`, emits `allApproved` if unanimous. |

**Server → Client**

| Event | Payload | Meaning |
| --- | --- | --- |
| `groupState` | `{ groupId, adminId, totalAmount, approvalStatus, members }` | Authoritative snapshot; the client renders directly from this. |
| `userJoined` | `{ userId, username, message }` | A new member joined. |
| `allApproved` | `{ message }` | Every member has approved; the leader can proceed. |
| `paymentComplete` | `{ transactionId, groupId, amount, message }` | Payment settled; show the success screen. |
| `error` | `{ message }` | Something went wrong server-side. |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A MySQL database (local or hosted)
- [Expo Go](https://expo.dev/go) on a phone, or an iOS/Android simulator, for mobile testing

### 1. Backend

```bash
cd Projects/FinalProject/backend
npm install
```

Point `models/db.js` at your own MySQL instance (database name, user, password, host). To create the tables on first run:

```bash
SYNC_DB=true npm start      # syncs Sequelize models, then serves on :3001
```

On subsequent runs just:

```bash
npm start
```

### 2. Frontend

```bash
cd Projects/FinalProject/frontend
npm install
npm start                   # Expo dev server
```

Then press `w` for web, `i` for the iOS simulator, `a` for Android, or scan the QR code with Expo Go.

`config/api.ts` and `socket.js` derive the backend host from the Expo dev server's LAN IP automatically, so the phone and the machine running the backend must be on the same network. The backend port (`3001`) is hard-coded on both sides.

### Trying the full flow locally

Open the app in two browser tabs (each tab is an independent session) or on two devices:

1. Tab A: enter a name → **Create New Group** → enter a bill amount.
2. Note the group code shown on the group screen.
3. Tab B: enter a different name → **Join Group** → paste the code.
4. Both tabs: toggle **Approve**. Watch approvals and the per-person split update live.
5. Tab A (leader): **Proceed to Payment** → **Continue with Payment**.
6. Both tabs land on **Payment Complete**.

## Configuration

| Where | Setting | Notes |
| --- | --- | --- |
| `backend/models/db.js` | DB name / user / password / host | Currently hard-coded — see limitations below. |
| `backend/app.js` | `PORT = 3001` | Also referenced by the frontend. |
| `frontend/config/api.ts` | API URL | Auto-derived from Expo host IP in dev. |
| `frontend/socket.js` | WebSocket URL | Same derivation as the API URL. |

### Known limitations

This is a course prototype, not a production system. Notably:

- **No authentication** — users are identified only by a chosen username.
- **Database credentials are committed** in `models/db.js` and should be moved to environment variables.
- **Card data is stored in plaintext** and "tokenization" is mocked — no real payment processor is involved.
- **Config is hard-coded** — port, and dev-only URL derivation, with no production build path.
- CORS is wide open (`origin: *`).

## Technical Challenges

| Challenge | Resolution |
| --- | --- |
| Duplicate socket connections when the same user was open on web *and* mobile | Singleton socket pattern — a single global connection owned by `GroupProvider`, reused by every screen via `connectSocket()`. |
| The same approval event firing several times within a second | Server-side dedupe: a `userId-groupId-approved` key is ignored if seen within 1000ms, with old keys swept after 5s. |
| Some members not seeing updates on mobile | Always broadcast the full `groupState` to *every* socket in the room (`io.to(room).emit`), rather than trying to diff or target individuals. |
| Keeping web and mobile state in sync | The client treats each `groupState` broadcast as the single source of truth and re-renders from it, with optimistic local updates for the acting user only. |
| Storage APIs differ across platforms | `usePersistence` hook abstracts `AsyncStorage` (mobile) vs. `sessionStorage` (web) behind one interface, including loading states. |

Our approach to the real-time layer was iterative: draw the flow as diagrams → reimplement a minimal class example → build the real feature barebones → refine.

## Reflection

**What we'd do differently: Express + REST + Socket.IO vs. GraphQL.** We chose Express to learn a new framework and stay in the Node ecosystem. In practice, a GraphQL API would have let us fetch an entire group's state in one request instead of several REST calls, and GraphQL subscriptions could have replaced the REST + Socket.IO combination with a single mechanism — less code, fewer sync bugs, and less over-fetching on mobile.

**Process lessons.** We needed more thorough up-front scoping of data models, specific functionality, and the frontend/backend contract, plus more live pair/mob coding sessions instead of coding in isolation and integrating late.

## Roadmap

- **Authentication** — real accounts and sessions.
- **Escrow** — members send their share to the leader before the transaction, not just approve it.
- **Manual splitting** — uneven splits, itemized shares.
- **Receipt OCR** — scan a paper receipt to auto-populate line items and the total.

## Team

Built for Northwestern's CS 396 - Full Stack Software Engineering course by:

- Sara Bouftas
- Namish Kaistha
- Aditi Ram
- Omar Sharaf
- Francis Velasco
