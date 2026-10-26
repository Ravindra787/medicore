# MediRemind — Smart Healthcare Medicine Reminder & Adherence Dashboard

> **MediRemind** is a modern, responsive, client-side medicine reminder web application designed with a premium dark SaaS aesthetic. It helps patients and caregivers track daily medication regimens, log individual doses, analyze weekly adherence trends, and receive timely in-app and browser notifications.

---

## 🚀 Key Highlights & Academic Submission Ready

- **100% Client-Side Architecture**: Operates entirely in the browser with **no backend, database, or API keys required**.
- **Persistent LocalStorage Layer**: All medications, dose states, and history logs persist automatically across sessions and browser refreshes.
- **Synthesized Audio Chimes**: Uses the native **Web Audio API** to generate dual-harmonic audio alerts without external MP3 files.
- **Browser & In-App Reminders**: Supports both native desktop notifications (via HTML5 Notification API) and in-app reminder dialogs.
- **Multi-slot Dose State Tracking**: Each dose for each specific date and scheduled time maintains its own independent status (`taken`, `skipped`, or `pending`). Marking a morning dose never overwrites the afternoon or evening slot.
- **Data Export & Import**: Full JSON backup and restore, plus CSV log export for easy grading, demonstration, and offline evaluation.
- **Preloaded Realistic Demo Dataset**: Pre-populated with realistic medications (Amoxicillin, Metformin, Vitamin D3, Cetirizine, Salbutamol) and 7-day adherence history for immediate visual demonstration.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [Vite](https://vite.dev/) |
| **Language** | JavaScript (ES6+ JSX) |
| **Styling** | Custom modular CSS with theme variables and responsive layout |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Data Visualizations** | [Recharts](https://recharts.org/) (Interactive Weekly Adherence Bar Chart) |
| **Celebrations** | [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) (Fires on 100% daily completion) |
| **Audio** | Web Audio API (Synthesizer Chimes) |
| **Storage** | Browser `window.localStorage` |

---

## 🎨 Design System & Theme

Crafted following modern healthcare dashboard ergonomics:

| Element | Color Hex | Preview |
|---|---|---|
| **Main Background** | `#0B0F19` | Deep space obsidian |
| **Sidebar Background** | `#101625` | Dark slate navy |
| **Card Surface** | `#151C2C` | Elevated dark card |
| **Card Hover** | `#1A2438` | Subtle interaction hover |
| **Borders** | `#263148` | Precision subtle border |
| **Primary Accent** | `#8B7CFF` | Vibrant healthcare violet |
| **Secondary Accent** | `#39D6B4` | Mint emerald (success & taken) |
| **Warning / Pending** | `#FFBE55` | Warm amber |
| **Danger / Skipped** | `#FF6B81` | Coral rose |
| **Main Typography** | `#F3F5FA` | Crisp high-contrast white |
| **Secondary Typography** | `#9BA7BD` | Muted cool gray |

---

## 📱 Application Modules & Features

### 1. Dashboard
- **Personalized Greeting**: Time-aware greeting (`Good morning`, `Good afternoon`, `Good evening, [User Name]`).
- **4 Metric Summary Cards**:
  - *Active Medicines* (Total prescriptions in regimen)
  - *Scheduled Today* (Total doses planned for today's date)
  - *Doses Taken Today* (Completed intakes)
  - *Pending Doses* (Awaiting intake)
- **Daily Adherence Meter**: Circular percentage meter with motivational status messages.
- **Weekly Adherence Chart**: 7-day interactive chart powered by Recharts comparing taken vs. skipped medications.
- **Next Upcoming Dose Card**: Highlights the immediate upcoming medicine with a quick "Mark as Taken" button.
- **Today's Dose Schedule**: Quick inline list of doses with instant status toggles.
- **Recent Activity Audit Feed**: Displays recent dose confirmations with relative timestamps.

### 2. My Medicines (Prescription Management)
- **Comprehensive Add / Edit Form**:
  - Medicine name & Dosage (e.g., `500 mg (1 capsule)`)
  - Medicine form / type with custom iconography: `Tablet`, `Capsule`, `Syrup`, `Drops`, `Inhaler`, `Injection`, or `Other`
  - Meal instructions: `Before Food`, `After Food`, `With Food`, or `Anytime`
  - Start date & optional End date (ongoing vs. fixed course)
  - Dynamic multiple reminder times per medicine (e.g. `08:00 AM`, `02:00 PM`, `08:00 PM`)
  - Flexible frequency: `Every Day` or `Specific Days of the Week` (Mon, Tue, Wed, etc.)
  - Doctor's instructions & notes
  - Color badge tag
- **Search & Filter**: Real-time filtering by medicine type (Tablets, Drops, etc.) and search by medication name.
- **Detail View Modal**: Deep dive into medication instructions, duration, and schedule.
- **Safe Deletion**: Two-step confirmation dialog before removing a prescription.

### 3. Today's Schedule & Dose Tracking
- **Time Window Segmentation**:
  - 🌅 **Morning**: 05:00 AM – 11:59 AM
  - ☀️ **Afternoon**: 12:00 PM – 04:59 PM
  - 🌆 **Evening**: 05:00 PM – 08:59 PM
  - 🌙 **Night**: 09:00 PM – 04:59 AM
- **Independent Dose Slots**: Taking a morning dose never auto-fills afternoon or evening slots.
- **Action Buttons**:
  - `Mark as Taken`: Confirms dose, updates statistics, plays pleasant audio chime, and triggers confetti if daily goal is reached.
  - `Mark as Skipped`: Records skipped dose with timestamp.
  - `Undo`: Easily reverts accidental clicks back to pending.
- **Calendar & Date Navigator**: Seamlessly view schedule for Today, Yesterday, Tomorrow, or pick any past/future calendar date.

### 4. History & Adherence Logs
- **Comprehensive Audit Trail**: Every taken and skipped dose is permanently recorded with exact date, time, and timestamp.
- **Filterable Records**: Filter logs by status (`Taken`, `Skipped`) or by specific prescription.
- **CSV Export**: One-click download of the complete adherence log as a `.csv` file.

### 5. Reminder Engine & Audio Alerts
- **Background Periodic Checker**: Runs every 15 seconds to check if any dose time matches the current clock minute.
- **In-App Modal Alert**: Prompts the user with dose details, food instructions, and immediate `Take Now` / `Dismiss` buttons.
- **Synthesized Audio Bell**: Web Audio API generates an instant chime without loading external media assets.
- **Browser Native Notifications**: Option to enable desktop notifications via `Notification.requestPermission()`.
- **Duplicate Prevention**: Tracks delivered reminders to prevent repetitive alerts for the same dose slot.

### 6. Settings & Data Portability
- **Profile Management**: Update your display name and email.
- **Reminder Controls**: Toggle audio chimes, enable browser notifications, or click **"Trigger Test Reminder"** to test everything on demand.
- **Reset to Demo Data**: One-click restoration of initial sample medicines and charts.
- **JSON Backup & Restore**: Export all app state to a `.json` file and import backups across different computers.
- **Clear All Data**: Completely wipe LocalStorage for fresh testing.

---

## 💻 How to Run Locally

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or yarn

### 1. Installation
In the project root directory, install all required dependencies:
```bash
npm install
```

### 2. Start Development Server
Launch the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to the local URL displayed in the terminal (typically `http://localhost:5173`).

### 3. Build for Production
To generate an optimized, minified production bundle:
```bash
npm run build
```

### 4. Preview Production Build
To preview the generated production build locally:
```bash
npm run preview
```

---

## 📂 Project Directory Structure

```
├── public/
│   └── favicon.svg              # SVG application logo
├── src/
│   ├── assets/                  # Static assets
│   ├── components/
│   │   ├── ConfirmationModal.jsx# Delete & reset confirmation dialogs
│   │   ├── MedicineDetailModal.jsx # Detailed prescription viewer
│   │   ├── MedicineModal.jsx    # Add / Edit medicine form with validation
│   │   ├── ReminderModal.jsx    # Due dose pop-up alert dialog
│   │   ├── Sidebar.jsx          # Collapsible desktop & mobile navigation
│   │   ├── ToastContainer.jsx   # Dynamic notification toast queue
│   │   └── TopNavbar.jsx        # Live clock, search bar, & quick reminder bell
│   ├── context/
│   │   └── AppContext.jsx       # Global application state & event handlers
│   ├── services/
│   │   ├── notification.js      # HTML5 Browser Notification API helper
│   │   ├── sound.js             # Web Audio API chime synthesizer
│   │   └── storage.js           # LocalStorage CRUD and initial demo dataset
│   ├── utils/
│   │   └── dateUtils.js         # Date formatting, dose slots, & metrics helpers
│   ├── views/
│   │   ├── DashboardView.jsx    # Overview metrics, charts, & adherence
│   │   ├── HistoryView.jsx      # Historical intake audit logs & CSV export
│   │   ├── MedicinesView.jsx    # Prescription cards & filter view
│   │   ├── ScheduleView.jsx     # Morning/Afternoon/Evening/Night dose view
│   │   └── SettingsView.jsx     # Profile, sound, backups, & demo data reset
│   ├── App.css                  # Reusable component and layout styles
│   ├── App.jsx                  # Main application orchestrator
│   ├── index.css                # Global CSS variables, reset, & dark theme
│   └── main.jsx                 # Application entry point
├── gemini.md                    # Project requirements specification
├── index.html                   # HTML template with Google Fonts (Plus Jakarta / Inter)
├── package.json                 # Project dependencies & scripts
├── README.md                    # Comprehensive documentation (this file)
└── vite.config.js               # Vite build configuration
```

---

## 🧪 Testing the Features

1. **Viewing Initial Demo Data**:
   - On first launch, 5 sample medicines are automatically loaded.
   - The weekly adherence chart and today's summary metrics are already populated for immediate review.

2. **Marking a Dose**:
   - Go to **Dashboard** or **Today's Schedule**.
   - Click **"Taken"** on any medicine.
   - Notice the green status badge, audio chime confirmation, updated statistics, and new entry in the **History** tab.
   - Click **"Undo"** if you want to revert it back to pending.

3. **Testing Reminders**:
   - Click the **Bell Icon** in the top navigation bar or go to **Settings**.
   - Click **"Test Alert"** or **"Trigger Test Reminder"**.
   - Hear the synthesized chime and see the due alert modal appear.

4. **Adding a New Medicine**:
   - Click **"+ Add Medicine"** in the sidebar or dashboard.
   - Enter medicine name, dosage, choose type, set meal instructions, and add one or more reminder times.
   - Save and see it immediately reflected in your schedule.

5. **Exporting Data**:
   - Go to **History** and click **"Export CSV Report"**.
   - Go to **Settings** and click **"Export JSON"** to save your database backup.

---

## 📄 License
Academic and educational use project. Created with React and Vite.
