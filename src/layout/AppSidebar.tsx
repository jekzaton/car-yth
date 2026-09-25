'use client';
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../context/SidebarContext';
import {
  CalenderIcon,
  Car2Icon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
} from '../icons/index';
import SidebarWidget from './SidebarWidget';
import { CarFront, FileCog, FilePen, Users } from 'lucide-react';
import api from '@/lib/axios';

type StatusLevel = 'user' | 'member' | 'admin';

interface CurrentUser {
  id: number;
  prefix: string;
  firstName: string;
  lastName: string;
  statusLevel: StatusLevel;
}
type ProfileApiResponse = {
  success?: boolean;
  data?: CurrentUser;
  user?: CurrentUser;
} & Partial<CurrentUser>;

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  roles: StatusLevel[];
};

const navItems: NavItem[] = [
  {
    icon: <CalenderIcon />,
    name: 'ปฏิทินใช้รถ',
    path: '/calendar',
    roles: ['admin', 'member', 'user'],
  },

  {
    icon: <CarFront className="h-6 w-6" />,
    name: 'จองรถ',
    path: '/bookingCar',
    roles: ['admin', 'member', 'user'],
  },

  // {
  //   name: 'Pages',
  //   icon: <PageIcon />,
  //   subItems: [
  //     { name: 'Blank Page', path: '/blank', pro: false },
  //     { name: '404 Error', path: '/error-404', pro: false },
  //   ],
  // },
];

const othersItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: 'Dashboard',
    path: '/dashboard',
    roles: ['admin', 'member'],
    // subItems: [{ name: 'Ecommerce', path: '/dashboard', pro: false }],
  },
  {
    icon: <FilePen />,
    name: 'จัดการจองรถ',
    subItems: [
      { name: 'รายการจอง', path: '/cars/carManage', pro: false },
      { name: 'จัดการคนขับรถ', path: '/users/user-car', pro: false },
    ],
    roles: ['admin', 'member'],
  },
  {
    icon: <FileCog />,
    name: 'การใช้ยานพาหนะ',
    subItems: [
      { name: 'การขับรถยนต์', path: '/carUsage/usage', pro: false },
      { name: 'เติมน้ำมัน', path: '/carUsage/car-oil', pro: false },
      { name: 'ซ่อมบำรุง', path: '/carUsage/car-repair', pro: false },
    ],
    roles: ['admin', 'member'],
  },
  {
    icon: <Users className="h-6 w-6" />,
    name: 'จัดการสมาชิก',
    subItems: [
      { name: 'จัดการสมาชิกทั่วไป', path: '/users', pro: false },
      { name: 'จัดการคนขับรถ', path: '/users/user-car', pro: false },
    ],
    roles: ['admin', 'member'],
  },
  {
    icon: <Car2Icon className="h-6 w-6" />,
    name: 'ยานพาหนะทั้งหมด',
    subItems: [
      { name: 'จัดการรถ', path: '/cars', pro: false },
      { name: 'ประเภทรถ', path: '/cars/type', pro: false },
      { name: 'ยี่ห้อรถ', path: '/cars/car-brand', pro: false },
      { name: 'ยี่ห้อน้ำมัน', path: '/cars/brand-oil', pro: false },
    ],
    roles: ['admin', 'member'],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchCurrentUser = async () => {
      try {
        const response = await api.get<ProfileApiResponse>('/api/auth/profile');

        const responseData = response.data;

        const user = responseData.data ?? responseData.user ?? responseData;

        if (!mounted) return;

        const statusLevel = user.statusLevel;

        if (
          statusLevel === 'user' ||
          statusLevel === 'member' ||
          statusLevel === 'admin'
        ) {
          setCurrentUser({
            id: Number(user.id),
            prefix: String(user.prefix ?? ''),
            firstName: String(user.firstName ?? ''),
            lastName: String(user.lastName ?? ''),
            statusLevel,
          });

          return;
        }

        console.error('ไม่พบ statusLevel จาก /api/auth/profile:', responseData);

        setCurrentUser(null);
      } catch (error) {
        console.error('โหลดข้อมูลผู้ใช้งานไม่สำเร็จ:', error);

        if (mounted) {
          setCurrentUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoadingUser(false);
        }
      }
    };

    void fetchCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleNavItems = useMemo(() => {
    if (!currentUser) return [];

    return navItems.filter((item) =>
      item.roles.includes(currentUser.statusLevel),
    );
  }, [currentUser]);

  const visibleOthersItems = useMemo(() => {
    if (!currentUser) return [];

    return othersItems.filter((item) =>
      item.roles.includes(currentUser.statusLevel),
    );
  }, [currentUser]);

  const canViewAdminMenu =
    currentUser?.statusLevel === 'admin' ||
    currentUser?.statusLevel === 'member';

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: 'main' | 'others',
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? 'menu-item-active'
                  : 'menu-item-inactive'
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'lg:justify-start'
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive'
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? 'text-brand-500 rotate-180'
                      : ''
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? 'menu-item-icon-active'
                      : 'menu-item-icon-inactive'
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : '0px',
              }}
            >
              <ul className="ml-9 mt-2 space-y-1">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? 'menu-dropdown-item-active'
                          : 'menu-dropdown-item-inactive'
                      }`}
                    >
                      {subItem.name}
                      <span className="ml-auto flex items-center gap-1">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? 'menu-dropdown-badge-active'
                                : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? 'menu-dropdown-badge-active'
                                : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: 'main' | 'others';
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ['main', 'others'].forEach((menuType) => {
      const items = menuType === 'main' ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as 'main' | 'others',
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: 'main' | 'others') => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 mt-16 flex h-[calc(100vh-4rem)] flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 lg:h-screen dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isMobileOpen ? 'w-72.5' : isHovered ? 'w-72.5' : 'w-22.5'
      } ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ================= LOGO ================= */}
      <div
        className={`flex shrink-0 py-8 ${
          isExpanded || isHovered || isMobileOpen
            ? 'justify-start'
            : 'w-full justify-center'
        }`}
      >
        <Link
          href="/"
          className={`flex items-center ${
            isExpanded || isHovered || isMobileOpen
              ? 'justify-start'
              : 'w-full justify-center'
          }`}
        >
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
                priority
                className="h-8 w-auto shrink-0 object-contain dark:hidden"
              />

              <Image
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
                priority
                className="hidden h-8 w-auto shrink-0 object-contain dark:block"
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon1.svg"
              alt="Logo"
              width={32}
              height={32}
              priority
              className="h-8 w-8 shrink-0 object-contain"
            />
          )}
        </Link>
      </div>

      {/* ================= SCROLL AREA ================= */}
      <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <nav className="pb-5">
          <div className="flex flex-col gap-4">
            {/* MENU */}
            <div>
              <h2
                className={`mb-4 flex text-xs uppercase leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? 'lg:justify-center'
                    : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  'Menu'
                ) : (
                  <HorizontaLDots />
                )}
              </h2>

              {!isLoadingUser && renderMenuItems(visibleNavItems, 'main')}
            </div>

            {/* ADMIN / MEMBER */}
            {!isLoadingUser && canViewAdminMenu && (
              <div>
                <h2
                  className={`mb-4 flex text-xs uppercase leading-5 text-gray-400 ${
                    !isExpanded && !isHovered
                      ? 'lg:justify-center'
                      : 'justify-start'
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    'Admin'
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>

                {renderMenuItems(visibleOthersItems, 'others')}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* ================= USER WIDGET ================= */}
      {(isExpanded || isHovered || isMobileOpen) && (
        <div className="shrink-0 border-t border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-gray-900">
          <SidebarWidget />
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
