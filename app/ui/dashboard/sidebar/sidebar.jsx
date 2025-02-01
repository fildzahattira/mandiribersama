'use client'
import { useState, useEffect } from "react";
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
    ],
  },
  {
    title: "Others",
    list: [
      {
        title: "Change Password",
        path: "/dashboard/user/changePassword",
        icon: <MdOutlinePassword />,
      },
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
              if (item.restricted && user.role === "Admin") {
                return ( 
                  <div key={item.title} className={styles.disabledLink}>
                    {item.icon}
                    <span>{item.title} (Super Admin Only)</span>
                  </div>
                );
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
