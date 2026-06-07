import styles from './ExpenseForm.module.css'
import Button from '../../Button/Button.jsx'
import { useEffect, useState } from 'react'

const CATEGORIES = ['Food', 'Travel', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Education', 'Other']
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other']

export default function ExpenseForm({ setIsOpen, onSubmit, editId, expenseList }) {

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    paymentMethod: '',
    notes: '',
    date: '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!formData.title || formData.title.trim() === '') {
      errs.title = 'Title is required'
    } else if (formData.title.length > 255) {
      errs.title = 'Title must be 255 characters or fewer'
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errs.price = 'Amount must be a positive number'
    }
    if (!formData.category) {
      errs.category = 'Category is required'
    }
    if (!formData.paymentMethod) {
      errs.paymentMethod = 'Payment method is required'
    }
    if (!formData.date) {
      errs.date = 'Date is required'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    if (onSubmit) {
      if (editId) {
        const oldItem = expenseList?.find(i => i._id === editId)
        const oldAmount = oldItem ? Number(oldItem.amount) : 0
        await onSubmit(editId, formData, oldAmount)
      } else {
        await onSubmit(formData)
      }
    }
  }

  // Pre-populate when editing
  useEffect(() => {
    if (editId && expenseList) {
      const item = expenseList.find(i => i._id === editId)
      if (item) {
        setFormData({
          title: item.title || '',
          category: item.category || '',
          price: String(item.amount || ''),
          paymentMethod: item.paymentMethod || '',
          notes: item.notes || '',
          date: item.expenseDate ? item.expenseDate.slice(0, 10) : '',
        })
      }
    }
  }, [editId, expenseList])

  return (
    <div className={styles.formWrapper}>
      <h3>{editId ? 'Edit Expense' : 'Add Expenses'}</h3>
      <form onSubmit={handleSubmit}>

        <div className={styles.fieldWrapper}>
          <input type="text" name="title" placeholder="Title"
            value={formData.title} onChange={handleChange} />
          {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
        </div>

        <div className={styles.fieldWrapper}>
          <input type="number" name="price" placeholder="Amount"
            value={formData.price} onChange={handleChange} min="0.01" step="0.01" />
          {errors.price && <span className={styles.fieldError}>{errors.price}</span>}
        </div>

        <div className={styles.fieldWrapper}>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="" disabled>Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <span className={styles.fieldError}>{errors.category}</span>}
        </div>

        <div className={styles.fieldWrapper}>
          <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
            <option value="" disabled>Payment method</option>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {errors.paymentMethod && <span className={styles.fieldError}>{errors.paymentMethod}</span>}
        </div>

        <div className={styles.fieldWrapper}>
          <input name="date" type="date" value={formData.date} onChange={handleChange} max={new Date().toISOString().split('T')[0]}/>
          {errors.date && <span className={styles.fieldError}>{errors.date}</span>}
        </div>

        <div className={styles.fieldWrapper}>
          <input type="text" name="notes" placeholder="Notes (optional)"
            value={formData.notes} onChange={handleChange} />
        </div>

        <Button type="submit" shadow>{editId ? 'Edit Expense' : 'Add Expense'}</Button>
        <Button shadow handleClick={() => setIsOpen(false)}>Cancel</Button>

      </form>
    </div>
  )
}
