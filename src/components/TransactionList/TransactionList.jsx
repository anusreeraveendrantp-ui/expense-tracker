import TransactionCard from '../TransactionCard/TransactionCard'
import styles from './TransactionList.module.css'
import Modal from '../Modal/Modal'
import ExpenseForm from '../Forms/ExpenseForm/ExpenseForm'
import { useState } from 'react'
import Pagination from '../Pagination/Pagination'

export default function TransactionList({
  transactions,
  title,
  loading,
  balance,
  currentPage,
  totalPages,
  setCurrentPage,
  onDelete,
  onEdit,
}) {
  const [editId, setEditId] = useState(null)
  const [isDisplayEditor, setIsDisplayEditor] = useState(false)

  const handleDelete = (id) => {
    if (window.confirm('Delete this expense?')) {
      onDelete(id)
    }
  }

  const handleEdit = (id) => {
    setEditId(id)
    setIsDisplayEditor(true)
  }

  const handleEditClose = () => {
    setIsDisplayEditor(false)
    setEditId(null)
  }

  return (
    <div className={styles.transactionsWrapper}>
      {title && <h2>{title}</h2>}

      {loading ? (
        <div className={styles.emptyTransactionsWrapper}>
          <p>Loading…</p>
        </div>
      ) : transactions.length > 0 ? (
        <div className={styles.list}>
          <div>
            {transactions.map(transaction => (
              <TransactionCard
                details={transaction}
                key={transaction._id}
                handleDelete={() => handleDelete(transaction._id)}
                handleEdit={() => handleEdit(transaction._id)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              updatePage={setCurrentPage}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          )}
        </div>
      ) : (
        <div className={styles.emptyTransactionsWrapper}>
          <p>No transactions!</p>
        </div>
      )}

      <Modal isOpen={isDisplayEditor} setIsOpen={handleEditClose}>
        <ExpenseForm
          editId={editId}
          expenseList={transactions}
          setIsOpen={handleEditClose}
          balance={balance}
          onSubmit={async (id, formData, oldAmount) => {
            await onEdit(id, formData, oldAmount)
            handleEditClose()
          }}
        />
      </Modal>
    </div>
  )
}
