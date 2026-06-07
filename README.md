# 💸 Expense Tracker

A full-stack web application to record, manage, and analyse personal expenses. Built with React.js on the frontend and Node.js/Express on the backend, backed by MongoDB Atlas.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| Frontend | https://expense-tracker-assesment.vercel.app |
| Backend API | (https://expense-tracker-1-qlur.onrender.com) |

---

## ✨ Features

### Core
- **User Authentication** — Register and login with JWT-based auth
- **Add Expense** — Title, amount, category, payment method, notes, date
- **Edit Expense** — Update any field inline from the dashboard
- **Delete Expense** — Confirmation prompt before removal
- **Wallet Balance** — Persisted in DB, updates automatically on add/edit/delete
- **Expense History** — Paginated table with all your expenses

### Search & Filter
- **Search** by title or category (debounced, 350ms)
- **Filter** by category dropdown
- **Clear filters** in one click
- **Pagination** — 5 records per page with prev/next navigation

### Dashboard
- **Total Expenses** — All-time sum
- **Monthly Expenses** — Current month spending
- **Recent Transactions** — Last 5 expenses at a glance
- **Category Pie Chart** — Spending breakdown by category (Recharts)
- **Monthly Trend Line Chart** — Last 6 months spending trend (Recharts)

---

## 🛠 Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React.js | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Recharts | Charts (Pie + Line) |
| Notistack | Toast notifications |
| CSS Modules | Component-scoped styling |

### Backend
| Tool | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB Atlas | Cloud database |
| Mongoose | ODM for MongoDB |
| JWT (jsonwebtoken) | Authentication tokens |
| bcrypt | Password hashing |
| dotenv | Environment variables |

### Deployment
| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

## 📁 Folder Structure

```
expense-tracker/
├── public/
├── src/
│   ├── api/
│   │   └── expenseApi.js        # Axios instance + all API calls
│   ├── components/
│   │   ├── AuthGuard/           # Protects private routes
│   │   ├── BarChart/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Forms/
│   │   │   ├── AddBalanceForm/
│   │   │   └── ExpenseForm/
│   │   ├── Modal/
│   │   ├── Pagination/
│   │   ├── PieChart/
│   │   ├── TransactionCard/
│   │   └── TransactionList/
│   ├── context/
│   │   └── AuthContext.js       # Auth state (login/register/logout)
│   ├── pages/
│   │   ├── Home/                # Main dashboard
│   │   ├── Login/
│   │   └── Register/
│   ├── App.js
│   └── index.js
│
└── server/
    ├── config/
    │   └── db.js                # MongoDB connection
    ├── controllers/
    │   ├── authController.js
    │   ├── dashboardController.js
    │   ├── expenseController.js
    │   └── userController.js
    ├── middleware/
    │   ├── authenticate.js      # JWT verification
    │   └── errorHandler.js
    ├── models/
    │   ├── Expense.js
    │   └── User.js
    ├── routes/
    │   ├── auth.js
    │   ├── dashboard.js
    │   ├── expenses.js
    │   └── user.js
    ├── validations/
    │   └── expenseValidation.js
    └── index.js
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, receive JWT |
| POST | `/api/auth/logout` | Logout |

### Expenses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expenses` | List expenses (paginated, searchable, filterable) |
| POST | `/api/expenses` | Create expense |
| GET | `/api/expenses/:id` | Get single expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

#### Query Parameters for `GET /api/expenses`
| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Records per page (default: 10) |
| `q` | string | Search by title or category |
| `category` | string | Filter by category |
| `sort` | string | `date_desc`, `date_asc`, `amount_desc`, `amount_asc` |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Total, monthly, recent, category breakdown, monthly trend |

### User / Wallet
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/user/balance` | Get wallet balance |
| PUT | `/api/user/balance` | Update wallet balance |

---

## 🗃 MongoDB Schemas

### User
```js
{
  name: String,           // required
  email: String,          // required, unique
  password: String,       // bcrypt hashed
  walletBalance: Number,  // default 0
  timestamps: true
}
```

### Expense
```js
{
  userId: ObjectId,       // ref: User
  title: String,          // required, max 255 chars
  amount: Number,         // required, > 0
  category: String,       // Food | Travel | Entertainment | Bills | Shopping | Health | Education | Other
  paymentMethod: String,  // Cash | Credit Card | Debit Card | UPI | Net Banking | Other
  notes: String,          // optional
  expenseDate: Date,      // required
  timestamps: true
}
```

---

## ⚙️ Setup — Run Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo
```bash
git clone (https://github.com/anusreeraveendrantp-ui/expense-tracker)
cd expense-tracker
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Install backend dependencies
```bash
cd server
npm install
```

### 4. Configure environment variables

Create `server/.env`:
```env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/expense_tracker
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 5. Start backend
```bash
cd server
node index.js
```

### 6. Start frontend (new terminal)
```bash
cd ..
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deployment

### Backend → Render
| Setting | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `node index.js` |

Environment variables to set in Render dashboard:
```
MONGO_URI      = <your Atlas URI>
JWT_SECRET     = <your secret>
JWT_EXPIRES_IN = 7d
CLIENT_URL     = <your Vercel frontend URL>
PORT           = 8000
```

### Frontend → Vercel
| Setting | Value |
|---|---|
| Framework | Create React App |
| Root Directory | `.` (project root) |

Environment variable to set in Vercel dashboard:
```
REACT_APP_API_URL = https://your-backend.onrender.com/api
```

---

## 🔐 Security Notes
- Passwords are hashed with **bcrypt** (10 salt rounds) — never stored as plain text
- JWT tokens expire after 7 days
- All expense endpoints are protected — users can only access their own data
- `.env` files are excluded from Git via `.gitignore`

---

## 👩‍💻 Author

**Anusree Raveendran**
