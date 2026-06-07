import styles from './TransactionCard.module.css'
import { IoMdCloseCircleOutline } from "react-icons/io";
import { PiPizza, PiGift } from "react-icons/pi";
import { MdOutlineModeEdit } from "react-icons/md";
import { BsSuitcase2 } from "react-icons/bs";

export default function TransactionCard({ details, handleDelete, handleEdit }) {
  // MongoDB schema uses: title, amount, category, expenseDate, paymentMethod
  const title = details.title || details.description || ''
  const amount = details.amount ?? 0
  const category = (details.category || '').toLowerCase()
  const date = details.expenseDate
    ? new Date(details.expenseDate).toLocaleDateString()
    : details.date || ''
  const paymentMethod = details.paymentMethod || ''

  return (
    <div className={styles.card}>
      <div className={styles.cardInner}>
        <div className={styles.cardIcon}>
          {category === 'food' && <PiPizza />}
          {category === 'entertainment' && <PiGift />}
          {category === 'travel' && <BsSuitcase2 />}
          {!['food', 'entertainment', 'travel'].includes(category) && <PiGift />}
        </div>
        <div className={styles.cardInfo}>
          <h5>{title}</h5>
          <p>{date}{paymentMethod ? ` · ${paymentMethod}` : ''}</p>
        </div>
      </div>

      <div className={styles.cardInner}>
        <p className={styles.cardPrice}>{`₹${Number(amount).toFixed(2)}`}</p>
        <div className={styles.cardButtonWrapper}>
          <button className={styles.cardDelete} onClick={handleDelete} aria-label="Delete expense">
            <IoMdCloseCircleOutline />
          </button>
          <button className={styles.cardEdit} onClick={handleEdit} aria-label="Edit expense">
            <MdOutlineModeEdit />
          </button>
        </div>
      </div>
    </div>
  )
}
