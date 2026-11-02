'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import {
  CalendarDays,
  CarFront,
  ChevronDown,
  FileCog,
  FilePenLine,
  LayoutDashboard,
  MoreHorizontal,
  UsersRound,
} from 'lucide-react';

import { useSidebar } from '@/context/SidebarContext';
import api from '@/lib/axios';
import SidebarWidget from './SidebarWidget';

type StatusLevel = 'user' | 'member' | 'admin';
type MenuType = 'main' | 'others';

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

type SubNavItem = {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
};

type NavItem = {
  name: string;
  icon: ReactNode;
  path?: string;
  subItems?: SubNavItem[];
  roles: StatusLevel[];
};

type OpenSubmenu = {
  type: MenuType;
  index: number;
} | null;

const navItems: NavItem[] = [
  {
    icon: <CalendarDays className="h-[19px] w-[19px]" />,
    name: 'ปฏิทินใช้รถ',
    path: '/calendar',
    roles: ['admin', 'member', 'user'],
  },
  {
    icon: <CarFront className="h-[19px] w-[19px]" />,
    name: 'จองรถ',
    path: '/bookingCar',
    roles: ['admin', 'member', 'user'],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="h-[19px] w-[19px]" />,
    name: 'Dashboard',
    path: '/dashboard',
    roles: ['admin', 'member'],
  },
  {
    icon: <FilePenLine className="h-[19px] w-[19px]" />,
    name: 'จัดการจองรถ',
    subItems: [
      {
        name: 'รายการจอง',
        path: '/cars/carManage',
      },
    ],
    roles: ['admin', 'member'],
  },
  {
    icon: <FileCog className="h-[19px] w-[19px]" />,
    name: 'การใช้ยานพาหนะ',
    subItems: [
      {
        name: 'การขับรถยนต์',
        path: '/carUsage/usage',
      },
      {
        name: 'เติมน้ำมัน',
        path: '/carUsage/car-oil',
      },
      {
        name: 'ซ่อมบำรุง',
        path: '/carUsage/car-repair',
      },
    ],
    roles: ['admin', 'member'],
  },
  {
    icon: <UsersRound className="h-[19px] w-[19px]" />,
    name: 'จัดการสมาชิก',
    subItems: [
      {
        name: 'จัดการสมาชิกทั่วไป',
        path: '/users',
      },
      {
        name: 'จัดการคนขับรถ',
        path: '/users/user-car',
      },
    ],
    roles: ['admin'],
  },
  {
    icon: <CarFront className="h-[19px] w-[19px]" />,
    name: 'ยานพาหนะทั้งหมด',
    subItems: [
      {
        name: 'จัดการรถ',
        path: '/cars',
      },
      {
        name: 'ประเภทรถ',
        path: '/cars/type',
      },
      {
        name: 'ยี่ห้อรถ',
        path: '/cars/car-brand',
      },
      {
        name: 'ยี่ห้อน้ำมัน',
        path: '/cars/brand-oil',
      },
    ],
    roles: ['admin', 'member'],
  },
];

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');
function normalizePath(path: string): string {
  let normalized = path.replace(/\/+$/, '') || '/';

  if (
    basePath &&
    (normalized === basePath || normalized.startsWith(`${basePath}/`))
  ) {
    normalized = normalized.slice(basePath.length) || '/';
  }

  return normalized.replace(/\/+$/, '') || '/';
}

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered } = useSidebar();

  const pathname = usePathname();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [openSubmenu, setOpenSubmenu] = useState<OpenSubmenu>(null);

  const showLabels = isExpanded || isHovered || isMobileOpen;

  const isActive = useCallback(
    (path: string) => {
      const currentPath = normalizePath(pathname);
      const targetPath = normalizePath(path);

      // ต้องตรงกับ URL เมนูโดยตรง
      if (currentPath === targetPath) {
        return true;
      }

      // หน้า /cars เป็นหน้าจัดการรถเท่านั้น
      // ไม่ให้ Active พร้อม /cars/type หรือ /cars/car-brand
      if (targetPath === '/cars') {
        return false;
      }

      // หน้า /users เป็นหน้าจัดการสมาชิกทั่วไปเท่านั้น
      // ไม่ให้ Active พร้อม /users/user-car
      if (targetPath === '/users') {
        return false;
      }

      // เมนูอื่นรองรับหน้าลูก เช่น /cars/type/edit/1
      return targetPath !== '/' && currentPath.startsWith(`${targetPath}/`);
    },
    [pathname],
  );

  // โหลดข้อมูลผู้ใช้
  useEffect(() => {
    let mounted = true;

    async function fetchCurrentUser() {
      try {
        const response = await api.get<ProfileApiResponse>('/api/auth/profile');

        const data = response.data;
        const user = data.data ?? data.user ?? data;

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
        } else {
          setCurrentUser(null);
        }
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
    }

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

  // เปิดเมนูย่อยตาม URL ปัจจุบัน
  useEffect(() => {
    const groups: {
      type: MenuType;
      items: NavItem[];
    }[] = [
      { type: 'main', items: navItems },
      { type: 'others', items: othersItems },
    ];

    for (const group of groups) {
      const index = group.items.findIndex((item) =>
        item.subItems?.some((subItem) => isActive(subItem.path)),
      );

      if (index !== -1) {
        setOpenSubmenu({
          type: group.type,
          index,
        });
        return;
      }
    }

    setOpenSubmenu(null);
  }, [pathname, isActive]);

  const handleSubmenuToggle = (index: number, type: MenuType) => {
    setOpenSubmenu((previous) => {
      if (previous?.type === type && previous.index === index) {
        return null;
      }

      return { type, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: MenuType) => (
    <ul className="space-y-1">
      {items.map((nav, index) => {
        const isOpen =
          openSubmenu?.type === menuType && openSubmenu.index === index;

        const hasActiveChild =
          nav.subItems?.some((subItem) => isActive(subItem.path)) ?? false;

        const active = nav.path ? isActive(nav.path) : hasActiveChild;

        const itemClass = `
          group flex min-h-[42px] w-full
          items-center gap-3 rounded-xl
          px-3 py-2.5 text-left
          text-[12px] font-medium
          transition-colors duration-200
          ${
            active || isOpen
              ? 'bg-blue-500/10 font-semibold text-blue-600 dark:text-blue-400'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }
          ${!showLabels ? 'justify-center px-2' : 'justify-start'}
        `;

        const iconClass = `
          flex h-5 w-5 shrink-0 items-center justify-center
          ${
            active || isOpen
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-muted-foreground group-hover:text-foreground'
          }
        `;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                type="button"
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={itemClass}
                title={!showLabels ? nav.name : undefined}
                aria-expanded={isOpen}
              >
                <span className={iconClass}>{nav.icon}</span>

                {showLabels && (
                  <>
                    <span className="min-w-0 flex-1 truncate">{nav.name}</span>

                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </>
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={itemClass}
                  title={!showLabels ? nav.name : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className={iconClass}>{nav.icon}</span>

                  {showLabels && (
                    <span className="min-w-0 flex-1 truncate">{nav.name}</span>
                  )}
                </Link>
              )
            )}

            {/* SUBMENU */}
            {nav.subItems && showLabels && (
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  isOpen
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <ul className="border-border ml-5 mt-1 space-y-0.5 border-l pl-3">
                    {nav.subItems.map((subItem) => {
                      const subActive = isActive(subItem.path);

                      return (
                        <li key={subItem.path}>
                          <Link
                            href={subItem.path}
                            aria-current={subActive ? 'page' : undefined}
                            className={`flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors duration-200 ${
                              subActive
                                ? 'bg-blue-500/10 font-semibold text-blue-600 dark:text-blue-400'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            } `}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                subActive
                                  ? 'bg-blue-500'
                                  : 'bg-muted-foreground/40'
                              }`}
                            />

                            <span className="min-w-0 flex-1 truncate">
                              {subItem.name}
                            </span>

                            {subItem.new && (
                              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                                NEW
                              </span>
                            )}

                            {subItem.pro && (
                              <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-600">
                                PRO
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`border-border bg-card text-foreground fixed inset-y-0 left-0 z-50 flex h-dvh flex-col border-r shadow-sm transition-[width,transform] duration-300 ease-in-out ${
        isMobileOpen
          ? 'w-[min(240px,calc(100vw-16px))] translate-x-0'
          : 'w-[min(240px,calc(100vw-16px))] -translate-x-full'
      } lg:translate-x-0 ${isExpanded || isHovered ? 'lg:w-60' : 'lg:w-19'} `}
    >
      {/* LOGO */}
      <div
        className={`border-border h-17 flex shrink-0 items-center border-b ${
          showLabels ? 'justify-start px-4' : 'justify-center px-2'
        } `}
      >
        <Link
          href="/"
          className={`flex min-w-0 items-center ${
            showLabels ? 'justify-start' : 'justify-center'
          }`}
          aria-label="CAR-YTH หน้าหลัก"
        >
          {showLabels ? (
            <>
              <Image
                src={`${basePath}/images/logo/logo.svg`}
                alt="CAR-YTH"
                width={150}
                height={40}
                priority
                className="max-w-48.75 h-8 w-auto object-contain dark:hidden"
              />

              <Image
                src={`${basePath}/images/logo/logo-dark.svg`}
                alt="CAR-YTH"
                width={150}
                height={40}
                priority
                className="max-w-48.75 hidden h-8 w-auto object-contain dark:block"
              />
            </>
          ) : (
            <Image
              src={`${basePath}/images/logo/logo-icon1.svg`}
              alt="CAR-YTH"
              width={34}
              height={34}
              priority
              className="h-8 w-8 object-contain"
            />
          )}
        </Link>
      </div>

      {/* NAVIGATION */}
      <div
        className={`sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-4 ${
          showLabels ? 'px-3' : 'px-2'
        } `}
      >
        <nav className="space-y-6 pb-4">
          <div>
            <MenuHeading label="MENU" showLabels={showLabels} />

            {!isLoadingUser && renderMenuItems(visibleNavItems, 'main')}
          </div>

          {!isLoadingUser && canViewAdminMenu && (
            <div>
              <MenuHeading label="ADMIN" showLabels={showLabels} />

              {renderMenuItems(visibleOthersItems, 'others')}
            </div>
          )}
        </nav>
      </div>

      {/* USER PROFILE */}
      {showLabels && (
        <div className="border-border bg-card shrink-0 border-t p-3">
          <SidebarWidget />
        </div>
      )}
    </aside>
  );
}

function MenuHeading({
  label,
  showLabels,
}: {
  label: string;
  showLabels: boolean;
}) {
  return (
    <div
      className={`mb-3 flex h-5 items-center ${
        showLabels ? 'justify-start px-3' : 'justify-center'
      }`}
    >
      {showLabels ? (
        <span className="text-muted-foreground/70 text-[10px] font-bold tracking-[0.12em]">
          {label}
        </span>
      ) : (
        <MoreHorizontal className="text-muted-foreground/60 h-5 w-5" />
      )}
    </div>
  );
}
