import Link from 'next/link'
import styles from '@/app/ui/dashboard/invoice/invoice.module.css'
import Search from "@/app/ui/dashboard/search/search"
import Pagination from "@/app/ui/dashboard/pagination/pagination"


const ListInvoice = () => {
    return (
        <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search invoice..."/>
        <Link href="/dashboard/invoice/create">
          <button className={styles.addButton}>Create Invoice</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Invoice Number</td>
            <td>Client Name</td>
            <td>Total Amount</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div className={styles.invoiceNumber}>
                001A
              </div>
            </td>
            <td>PT. XYZ</td>
            <td>Rp. 1000</td>
            <td>
              <div className={styles.buttons}>
                <Link href="/">
                  <button className={`${styles.button} ${styles.detail}`}>Detail</button>
                </Link>
                  {/* <button className={`${styles.button} ${styles.delete}`}>Delete</button> */}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination/>
    </div>
    )
}

export default ListInvoice