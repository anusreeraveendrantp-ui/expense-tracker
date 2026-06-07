import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import ExpenseForm from "../../components/Forms/ExpenseForm/ExpenseForm";
import Modal from "../../components/Modal/Modal";
import AddBalanceForm from "../../components/Forms/AddBalanceForm/AddBalanceForm";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../api/expenseApi";
import { useSnackbar } from "notistack";
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";

// ── constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Food", "Travel", "Entertainment", "Bills", "Shopping", "Health", "Education", "Other"];
const PIE_COLORS = ["#A000FF", "#FF9304", "#FDE006", "#00C49F", "#FF6B6B", "#4FC3F7", "#81C784", "#FFB74D"];

export default function Home() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const searchTimer = useRef(null);

  // ── state ─────────────────────────────────────────────────────────────────
  const [balance, setBalance] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  // Expense history (search/filter/pagination)
  const [expenses, setExpenses] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const PAGE_SIZE = 5;

  // Modals
  const [isOpenExpense, setIsOpenExpense] = useState(false);
  const [isOpenBalance, setIsOpenBalance] = useState(false);
  const [editId, setEditId] = useState(null);

  // ── helpers ───────────────────────────────────────────────────────────────
  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n || 0);

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  // ── fetch functions ───────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    try {
      setDashLoading(true);
      const res = await api.getDashboard();
      setDashboard(res.data);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    } finally {
      setDashLoading(false);
    }
  }, []);

  const fetchExpenses = useCallback(async (page = 1, q = "", cat = "") => {
    try {
      setListLoading(true);
      const params = { page, limit: PAGE_SIZE, sort: "date_desc" };
      if (q) params.q = q;
      if (cat) params.category = cat;
      const res = await api.listExpenses(params);
      const { data, totalPages: tp, total } = res.data;
      setExpenses(data);
      setTotalPages(tp);
      setTotalCount(total);
      setCurrentPage(page);
    } catch {
      enqueueSnackbar("Failed to load expenses", { variant: "error" });
    } finally {
      setListLoading(false);
    }
  }, [enqueueSnackbar]);

  // const refreshAll = useCallback(() => {
  //   fetchDashboard();
  //   fetchExpenses(currentPage, searchQuery, filterCategory);
  // }, [fetchDashboard, fetchExpenses, currentPage, searchQuery, filterCategory]);

  // ── on mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Fetch wallet balance from DB
    api.getWalletBalance()
      .then((res) => setBalance(res.data.walletBalance))
      .catch(() => setBalance(0));
    fetchDashboard();
    fetchExpenses(1, "", "");
  }, [fetchDashboard, fetchExpenses]);

  // ── search debounce ───────────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setCurrentPage(1);
      fetchExpenses(1, val, filterCategory);
    }, 350);
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setFilterCategory(val);
    setCurrentPage(1);
    fetchExpenses(1, searchQuery, val);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterCategory("");
    setCurrentPage(1);
    fetchExpenses(1, "", "");
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleAddExpense = async (formData) => {
    if (balance < Number(formData.price)) {
      enqueueSnackbar("Amount exceeds wallet balance", { variant: "warning" });
      return;
    }
    try {
      await api.createExpense({
        title: formData.title,
        amount: Number(formData.price),
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || "",
        expenseDate: formData.date,
      });
      const newBalance = balance - Number(formData.price);
      await api.updateWalletBalance(newBalance);
      setBalance(newBalance);
      setIsOpenExpense(false);
      enqueueSnackbar("Expense added", { variant: "success" });
      fetchDashboard();
      fetchExpenses(1, searchQuery, filterCategory);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || "Failed to add expense", { variant: "error" });
    }
  };

  const handleEditExpense = async (id, formData, oldAmount) => {
    const diff = oldAmount - Number(formData.price);
    if (diff < 0 && Math.abs(diff) > balance) {
      enqueueSnackbar("Updated amount exceeds wallet balance", { variant: "warning" });
      return;
    }
    try {
      await api.updateExpense(id, {
        title: formData.title,
        amount: Number(formData.price),
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || "",
        expenseDate: formData.date,
      });
      const newBalance = balance + diff;
      await api.updateWalletBalance(newBalance);
      setBalance(newBalance);
      setEditId(null);
      enqueueSnackbar("Expense updated", { variant: "success" });
      fetchDashboard();
      fetchExpenses(currentPage, searchQuery, filterCategory);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || "Failed to update expense", { variant: "error" });
    }
  };

  const handleDelete = async (expense) => {
    if (!window.confirm(`Delete "${expense.title}"?`)) return;
    try {
      await api.deleteExpense(expense._id);
      const newBalance = balance + Number(expense.amount);
      await api.updateWalletBalance(newBalance);
      setBalance(newBalance);
      enqueueSnackbar("Expense deleted", { variant: "success" });
      const newPage = expenses.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      fetchDashboard();
      fetchExpenses(newPage, searchQuery, filterCategory);
    } catch {
      enqueueSnackbar("Failed to delete expense", { variant: "error" });
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  // ── chart data from dashboard ─────────────────────────────────────────────
  const pieData = (dashboard?.categoryBreakdown || []).filter((c) => c.value > 0);
  const lineData = dashboard?.monthlyTrend || [];

  return (
    <div className={styles.container}>

      {/* ── NAV BAR ── */}
      <header className={styles.navbar}>
        <h1 className={styles.logo}>💸 Expense Tracker</h1>
        <div className={styles.navRight}>
          <span className={styles.userEmail}>{user?.name || user?.email}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* ── SUMMARY CARDS ── */}
      <section className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Wallet Balance</p>
          <p className={`${styles.summaryValue} ${styles.green}`}>{fmt(balance)}</p>
          <button className={styles.summaryBtn} onClick={() => setIsOpenBalance(true)}>+ Add Income</button>
        </div>

        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Total Expenses</p>
          <p className={`${styles.summaryValue} ${styles.orange}`}>{dashLoading ? "…" : fmt(dashboard?.totalAllTime)}</p>
          <button className={styles.summaryBtn} style={{ background: "#FF3E3E" }} onClick={() => setIsOpenExpense(true)}>+ Add Expense</button>
        </div>

        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>This Month</p>
          <p className={`${styles.summaryValue} ${styles.purple}`}>{dashLoading ? "…" : fmt(dashboard?.totalThisMonth)}</p>
          <p className={styles.summaryHint}>Current month spending</p>
        </div>
      </section>

      {/* ── CHARTS ROW ── */}
      <section className={styles.chartsRow}>
        {/* Category Pie Chart */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Category Breakdown</h2>
          {pieData.length === 0 ? (
            <p className={styles.emptyMsg}>No expense data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={90} labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => fmt(val)} />
                <Legend iconType="rect" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Trend Line Chart */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Monthly Trend</h2>
          {lineData.length === 0 ? (
            <p className={styles.emptyMsg}>No trend data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="label" tick={{ fill: "#ccc", fontSize: 12 }} />
                <YAxis tick={{ fill: "#ccc", fontSize: 12 }} />
                <Tooltip formatter={(val) => fmt(val)} />
                <Line type="monotone" dataKey="total" stroke="#A000FF" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ── RECENT TRANSACTIONS ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Transactions</h2>
        <div className={styles.recentList}>
          {dashLoading ? (
            <p className={styles.emptyMsg}>Loading…</p>
          ) : (dashboard?.recentExpenses || []).length === 0 ? (
            <p className={styles.emptyMsg}>No recent transactions</p>
          ) : (
            (dashboard?.recentExpenses || []).map((exp) => (
              <div key={exp._id} className={styles.recentItem}>
                <div className={styles.recentLeft}>
                  <span className={styles.recentCategory}>{exp.category}</span>
                  <span className={styles.recentTitle}>{exp.title}</span>
                  <span className={styles.recentDate}>{fmtDate(exp.expenseDate)}</span>
                </div>
                <span className={styles.recentAmount}>{fmt(exp.amount)}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── EXPENSE HISTORY (search + filter + table + pagination) ── */}
      <section className={styles.section}>
        <div className={styles.historyHeader}>
          <h2 className={styles.sectionTitle}>Expense History</h2>
          <button className={styles.addBtn} onClick={() => { setEditId(null); setIsOpenExpense(true); }}>
            + Add Expense
          </button>
        </div>

        {/* Search & Filter */}
        <div className={styles.filterRow}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="🔍  Search by title or category…"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <select
            className={styles.filterSelect}
            value={filterCategory}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {(searchQuery || filterCategory) && (
            <button className={styles.clearBtn} onClick={handleClearFilters}>✕ Clear</button>
          )}
        </div>

        {/* Expense Table */}
        {listLoading ? (
          <p className={styles.emptyMsg}>Loading…</p>
        ) : expenses.length === 0 ? (
          <p className={styles.emptyMsg}>
            {searchQuery || filterCategory ? "No expenses match your search." : "No expenses yet. Add one!"}
          </p>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp._id}>
                      <td>
                        <span className={styles.expTitle}>{exp.title}</span>
                        {exp.notes && <span className={styles.expNotes}>{exp.notes}</span>}
                      </td>
                      <td><span className={styles.catBadge}>{exp.category}</span></td>
                      <td className={styles.amountCell}>{fmt(exp.amount)}</td>
                      <td>{exp.paymentMethod}</td>
                      <td>{fmtDate(exp.expenseDate)}</td>
                      <td className={styles.actionsCell}>
                        <button
                          className={styles.editBtn}
                          onClick={() => { setEditId(exp._id); setIsOpenExpense(true); }}
                        >Edit</button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(exp)}
                        >Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  disabled={currentPage === 1}
                  onClick={() => fetchExpenses(currentPage - 1, searchQuery, filterCategory)}
                >← Prev</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ""}`}
                    onClick={() => fetchExpenses(p, searchQuery, filterCategory)}
                  >{p}</button>
                ))}

                <button
                  className={styles.pageBtn}
                  disabled={currentPage === totalPages}
                  onClick={() => fetchExpenses(currentPage + 1, searchQuery, filterCategory)}
                >Next →</button>

                <span className={styles.pageInfo}>{totalCount} total</span>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── MODALS ── */}
      <Modal isOpen={isOpenExpense} setIsOpen={(v) => { setIsOpenExpense(v); if (!v) setEditId(null); }}>
        <ExpenseForm
          setIsOpen={(v) => { setIsOpenExpense(v); if (!v) setEditId(null); }}
          balance={balance}
          editId={editId}
          expenseList={expenses}
          onSubmit={editId ? handleEditExpense : handleAddExpense}
        />
      </Modal>

      <Modal isOpen={isOpenBalance} setIsOpen={setIsOpenBalance}>
        <AddBalanceForm setIsOpen={setIsOpenBalance} balance={balance} setBalance={setBalance} />
      </Modal>
    </div>
  );
}
