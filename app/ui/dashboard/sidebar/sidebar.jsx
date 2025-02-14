'use client'
import MenuLink from "./menuLink/menuLink";
import styles from "./sidebar.module.css";
import {
  FaFileInvoiceDollar,
  FaListUl,
  FaUserFriends,
} from "react-icons/fa";
import {
  MdOutlineAccountCircle,
  MdDashboard,
  MdLogout,
} from "react-icons/md";

const menuItems = [
  {
    title: "Pages",
    list: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: <MdDashboard />,
      },
    ],
  },
  {
    title: "Invoice",
    list: [
      {
        title: "Create Invoice",
        path: "/dashboard/invoice/create",
        icon: <FaFileInvoiceDollar />,
      },
      {
        title: "List Invoice",
        path: "/dashboard/invoice/list",
        icon: <FaListUl />,
      },
    ],
  },
  {
    title: "User",
    list: [
      {
        title: "Create User",
        path: "/dashboard/user/create",
        icon: <FaUserFriends />,
      },
      {
        title: "List User",
        path: "/dashboard/user/list",
        icon: <FaListUl />,
      },
    ],
  },
  {
    title: "Others",
    list: [
      {
        title: "Logout",
        path: "/logout",
        icon: <MdLogout />,
      },
    ],
  },
];

const Sidebar = () => {
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Redirect ke halaman login setelah logout berhasil
        window.location.href = "/login";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <MdOutlineAccountCircle className={styles.accountIcon} />
        <div className={styles.userDetail}>
          {/* <span className={styles.username}>Park Jimin</span> */}
          <span className={styles.userTitle}>Admin</span>
        </div>
      </div>
      <ul className={styles.list}>
        {menuItems.map((cat) => (
          <li key={cat.title}>
            <span className={styles.cat}>{cat.title}</span>
            {cat.list.map((item) => (
              <MenuLink
                key={item.title}
                item={item}
                onClick={item.title === "Logout" ? handleLogout : undefined} // Teruskan handleLogout untuk item Logout
              />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;