import styles from './AddBalanceForm.module.css'
import Button from '../../Button/Button.jsx'
import { useState } from 'react'
import { useSnackbar } from 'notistack';
import { updateWalletBalance } from '../../../api/expenseApi';

export default function AddBalanceForm({ setIsOpen, balance, setBalance }) {

  const [income, setIncome] = useState('')
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault()

    const amount = Number(income)
    if (!income || isNaN(amount) || amount <= 0) {
      enqueueSnackbar("Please enter a valid positive amount", { variant: "warning" })
      return
    }

    const newBalance = (balance || 0) + amount

    try {
      setLoading(true)
      await updateWalletBalance(newBalance)
      setBalance(newBalance)
      enqueueSnackbar(`₹${amount.toFixed(2)} added to wallet`, { variant: "success" })
      setIsOpen(false)
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || "Failed to update balance", { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.formWrapper}>
      <h3>Add Balance</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Income Amount"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          min="0.01"
          step="0.01"
          required
        />
        <Button type="submit" shadow disabled={loading}>
          {loading ? 'Saving…' : 'Add Balance'}
        </Button>
        <Button shadow handleClick={() => setIsOpen(false)}>Cancel</Button>
      </form>
    </div>
  )
}
