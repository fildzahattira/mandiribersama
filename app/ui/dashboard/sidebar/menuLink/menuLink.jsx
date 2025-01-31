"use client";
import { usePathname } from "next/navigation";
import styles from "./menuLink.module.css";
import Link from "next/link";

const MenuLink = ({ item, onClick }) => {
  const pathname = usePathname();

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault(); // Mencegah navigasi default jika ada onClick
      onClick();
    }
  };

  return (
    <Link
      href={item.path}
      className={`${styles.container} ${pathname === item.path && styles.active}`}
      onClick={handleClick} // Tambahkan onClick ke Link
    >
      {item.icon}
      {item.title}
    </Link>
  );
};

export default MenuLink;