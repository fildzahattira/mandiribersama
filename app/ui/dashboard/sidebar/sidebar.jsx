'use client'
import { useState, useEffect } from "react";
import MenuLink from "./menuLink/menuLink";
import styles from "./sidebar.module.css";
import {
  FaFileInvoiceDollar,
  FaListUl,
  FaUserFriends,
  FaArchive,
  FaKey,
} from "react-icons/fa";
import {
  MdOutlineAccountCircle,
  MdDashboard,
  MdOutlinePassword,
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
      {
        title: "Approval Invoice",
        path: "/dashboard/invoice/approve",
        icon: <FaKey />,
        restricted: true, 
      },
      {
        title: "Archive Invoice",
        path: "/dashboard/invoice/archive",
        icon: <FaArchive />,
        restricted: true, 
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
        restricted: true, 
      },
      {
        title: "List User",
        path: "/dashboard/user/list",
        icon: <FaListUl />,
        restricted: true, 
      },
      {
        title: "Change My Password",
        path: "/dashboard/user/changePassword",
        icon: <MdOutlinePassword />,
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
  const [user, setUser] = useState({ username: "Loading...", role: "Loading..." });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth", {
          credentials: "include", 
        });
        if (response.ok) {
          const data = await response.json();
          setUser({ username: data.admin_name, role: data.admin_role });
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
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
        <img src="/logo_polos.png" alt="CV. Mandiri Bersama" className={styles.logo} />
      
      <div className={styles.user}>
        <MdOutlineAccountCircle className={styles.accountIcon} />
        <div className={styles.userDetail}>
          <span className={styles.username}>{user.username}</span>
          <span className={styles.userTitle}>{user.role}</span>
        </div>
      </div>
      <ul className={styles.list}>
        {menuItems.map((cat) => (
          <li key={cat.title}>
            <span className={styles.cat}>{cat.title}</span>
            {cat.list.map((item) => {
              // Jika item restricted dan role adalah Admin, jangan render menu tersebut
              if (item.restricted && user.role === "Admin") {
                return null;
              }
              return (
                <MenuLink
                  key={item.title}
                  item={item}
                  onClick={item.title === "Logout" ? handleLogout : undefined}
                />
              );
            })}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;