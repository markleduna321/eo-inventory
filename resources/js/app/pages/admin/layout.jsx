import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from '@headlessui/react';
import {
  ArchiveBoxIcon,
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  BellAlertIcon,
  BellIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  ChartBarIcon,
  ChartPieIcon,
  ChatBubbleBottomCenterIcon,
  Cog6ToothIcon,
  CogIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  DocumentChartBarIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  DocumentTextIcon,
  FolderIcon,
  FolderOpenIcon,
  HomeIcon,
  HomeModernIcon,
  MapPinIcon,
  UserCircleIcon,
  UserGroupIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Link, usePage, router } from '@inertiajs/react';
import { hasAnyPermission, PERMISSIONS } from '@/app/utils/permissions';
import ProfileEditSection from './_components/profile-edit-section';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'User Management', href: '/admin/user_management', icon: UsersIcon },
  { name: 'Assets', href: '', icon: FolderIcon },
  { name: 'Devices', href: '#', icon: FolderIcon },
  { name: 'System Unit', href: '#', icon: FolderIcon },
  { name: 'Peripherals', href: '#', icon: FolderIcon },
  { name: 'Parts', href: '#', icon: FolderIcon },
  { name: 'Accessories', href: '#', icon: FolderIcon },
  { name: 'Reports', href: '/admin/reports', icon: ChartPieIcon },
];

const userNavigation = [
  { name: 'Your profile', href: '#' },
  { name: 'Sign out', href: '#' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout({ children }) {
  const { auth, csrf_token } = usePage().props;
  const user = auth?.user;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navItems, setNavItems] = useState(navigation);
  const [openItems, setOpenItems] = useState({});
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [isAssetsOpen1, setIsAssetsOpen1] = useState(false);

  // Handle profile modal
  const handleOpenProfile = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileModalOpen(false);
  };

  // Handle logout with CSRF token refresh fallback
      const handleLogout = async () => {
        try {
            // Simple logout using Inertia's post method with proper CSRF handling
            router.post('/logout', {}, {
                onFinish: () => {
                    // Ensure we redirect to home after logout
                    window.location.href = '/';
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback: redirect to home page
            window.location.href = '/';
        }
    };

  function isChildActive(children, currentPath) {
    return children?.some(child => child.link === currentPath);
  }

  // Define sidenav first before using it
  const sidenav = [
    {
      label: "Dashboard",
      icon: <ChartBarIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
      link: "/admin/dashboard",
      requiredPermissions: [PERMISSIONS.DASHBOARD_VIEW]
    },
    {
      label: "User Management",
      icon: <UserGroupIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
      link: "/admin/user_management",
      requiredPermissions: [PERMISSIONS.USERS_VIEW, PERMISSIONS.ROLES_VIEW]
    },
    {
      label: "Request",
      icon: <BellAlertIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
      link: "",
      requiredPermissions: [PERMISSIONS.REQUESTS_VIEW, PERMISSIONS.PURCHASE_REQUESTS_VIEW],
      children: [
        {
          label: "Purchase Request",
          icon: <DevicePhoneMobileIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
          link: "/admin/purchase_request",
          requiredPermissions: [PERMISSIONS.PURCHASE_REQUESTS_VIEW]
        }, {
          label: "Item Request",
          icon: <ComputerDesktopIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
          link: "/admin/device-requests",
          requiredPermissions: [PERMISSIONS.REQUESTS_VIEW]
        }, {
          label: "Liability Forms",
          icon: <DocumentTextIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
          link: "/admin/liability-forms",
          requiredPermissions: [PERMISSIONS.REQUESTS_VIEW]
        },
      ]
    },
    {
      label: "Assets",
      icon: <ArchiveBoxIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
      link: "",
      requiredPermissions: [PERMISSIONS.ASSETS_VIEW],
      children: [
        {
          label: "Devices",
          icon: <DevicePhoneMobileIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
          link: "/admin/devices",
          requiredPermissions: [PERMISSIONS.DEVICES_MANAGE]
        }, {
          label: "System Units",
          icon: <ComputerDesktopIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
          link: "/admin/system_units",
          requiredPermissions: [PERMISSIONS.SYSTEM_UNITS_MANAGE]
        }, {
          label: "Monitors",
          icon: <ComputerDesktopIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
          link: "/admin/monitors",
          requiredPermissions: [PERMISSIONS.MONITORS_MANAGE]
        }, {
          label: "Peripherals",
          icon: <DeviceTabletIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
          link: "/admin/peripherals",
          requiredPermissions: [PERMISSIONS.PERIPHERALS_MANAGE]
        }, {
          label: "Parts and Accessories",
          icon: <CogIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
          link: "/admin/parts_and_accessories",
          requiredPermissions: [PERMISSIONS.PARTS_MANAGE]
        }, {
          label: "Other Assets",
          icon: <ArchiveBoxIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
          link: "/admin/other_assets",
          requiredPermissions: [PERMISSIONS.OTHER_ASSETS_VIEW]
        }, {
          label: "Device Returns",
          icon: <ArrowLeftStartOnRectangleIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
          link: "/admin/device-returns",
          requiredPermissions: [PERMISSIONS.DEVICE_RETURNS_VIEW]
        },

      ]
    },
    {
      label: "Reports",
      icon: <DocumentChartBarIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
      link: "/admin/reports",
      requiredPermissions: [PERMISSIONS.REPORTS_VIEW]
    },
    {
      label: "Stations",
      icon: <BuildingOffice2Icon aria-hidden="true" className="h-6 w-6 shrink-0" />,
      link: "/admin/stations",
      requiredPermissions: [PERMISSIONS.STATIONS_VIEW]
    },
    {
      label: "Locations",
      icon: <MapPinIcon aria-hidden="true" className="h-6 w-6 shrink-0" />,
      link: "/admin/locations",
      requiredPermissions: [PERMISSIONS.LOCATIONS_VIEW]
    },
  ]

  // Filter navigation items based on user permissions
  const filterNavByPermissions = (navItems, user) => {
    if (!user || !user.role) {
      return [];
    }

    // Super Administrator should have access to everything
    if (user.role.name === 'Super Administrator' || user.role.level === 5) {
      return navItems;
    }

    return navItems.filter(item => {
      // If no permissions required, show the item
      if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
        return true;
      }

      // Check if user has any of the required permissions
      const hasPermission = hasAnyPermission(user, item.requiredPermissions);

      if (item.children) {
        // Filter children based on permissions
        item.children = item.children.filter(child => {
          if (!child.requiredPermissions || child.requiredPermissions.length === 0) {
            return true;
          }
          return hasAnyPermission(user, child.requiredPermissions);
        });

        // Show parent if it has permission OR if any children have permission
        return hasPermission || item.children.length > 0;
      }

      return hasPermission;
    });
  };

  // Get filtered navigation items
  const filteredSidenav = filterNavByPermissions(sidenav, user);

  useEffect(() => {
    const currentPath = window.location.pathname;

    const updatedNavItems = navItems.map((item) => ({
      ...item,
      current: item.href === currentPath,
    }));

    setNavItems(updatedNavItems);
  }, []);

  const toggleOpen = (index) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    const currentPath = window.location.pathname;
    const initialOpenItems = {};
    filteredSidenav.forEach((item, i) => {
      if (item.children && isChildActive(item.children, currentPath)) {
        initialOpenItems[i] = true;
      }
    });
    setOpenItems(initialOpenItems);
  }, [user]); // Add user as dependency

  return (
    <>
      <div>
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
                  </button>
                </div>
              </TransitionChild>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white pl-6 pr-2 pb-4 ring-1 ring-white/10">
                <div className="flex h-16 shrink-0 items-center">
                  <img
                    alt="Your Company"
                    src="/img/logo.jpg"
                    className="h-15 w-full pt-5"
                  />
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col">
                    {filteredSidenav.map((item, i) => (
                      <div key={i}>
                        <Link
                          href={item.link || "#"}
                          onClick={(e) => {
                            if (item.children) {
                              e.preventDefault(); // Prevent navigation if there are children
                              toggleOpen(i);      // Toggle the dropdown
                            }
                            // If no children, allow default behavior (navigation)
                          }}
                          className="group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                        >
                          <div className='flex  items-center justify-between w-full'>
                            <div className='flex gap-3'>
                              {item.icon}
                              {item.label}
                            </div>
                            {item.children && (
                              <ChevronDownIcon
                                className={`h-5 w-5 transition-transform duration-200 ${openItems[i] ? "rotate-180" : ""
                                  }`}
                                aria-hidden="true"
                              />
                            )}
                          </div>
                        </Link>

                        {item.children && openItems[i] && (
                          <ul className="ml-8 mt-1 space-y-1">
                            {item.children.map((child, j) => (
                              <li key={j}>
                                <Link
                                  href={child.link || "#"}
                                  className="group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                                >
                                  {child.icon}
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white pl-6 pr-2 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <img
                alt="Your Company"
                src="/img/logo.jpg"
                className="h-15 w-full pt-5"
              />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col">
                {filteredSidenav.map((item, i) => (
                  <div key={i}>
                    <Link
                      href={item.link || "#"}
                      onClick={(e) => {
                        if (item.children) {
                          e.preventDefault();
                          toggleOpen(i);
                        }
                      }}
                      className={
                        classNames(
                          "group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                          window.location.pathname === item.link
                            ? "bg-gray-800 text-white"
                            : "text-black hover:bg-gray-800 hover:text-white"
                        )
                      }
                    >
                      <div className='flex  items-center justify-between w-full'>
                        <div className='flex gap-3'>
                          {item.icon}
                          {item.label}
                        </div>
                        {item.children && (
                          <ChevronDownIcon
                            className={`h-5 w-5 transition-transform duration-200 ${openItems[i] ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </Link>

                    {item.children && openItems[i] && (
                      <ul className="ml-8 mt-1 space-y-1">
                        {item.children.map((child, j) => (
                          <li key={j}>
                            <Link
                              href={child.link || "#"}
                              className={
                                classNames(
                                  "group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                                  window.location.pathname === child.link
                                    ? "bg-gray-800 text-white"
                                    : "text-black hover:bg-gray-800 hover:text-white"
                                )
                              }
                            >
                              {child.icon}
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="h-6 w-6" />
            </button>

            {/* Separator */}
            <div aria-hidden="true" className="h-6 w-px bg-gray-900/10 lg:hidden" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form action="#" method="GET" className="relative flex flex-1">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>

                <input
                  id="search-field"
                  name="search"
                  type="search"
                  className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                />
              </form>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">View notifications</span>
                  <BellIcon aria-hidden="true" className="h-6 w-6" />
                </button>

                {/* Separator */}
                <div aria-hidden="true" className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" />

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <MenuButton className="-m-1.5 flex items-center p-1.5">
                    <span className="sr-only">Open user menu</span>
                    <UserCircleIcon className=' h-8' />
                    <span className="hidden lg:flex lg:items-center">
                      <span aria-hidden="true" className="ml-4 text-sm font-semibold leading-6 text-gray-900">
                        {user ? (
                          <span className="mb-0 text-sm font-weight-bold">{user.name}</span>
                        ) : (
                          <span className="mb-0 text-sm font-weight-bold">Loading...</span>
                        )}
                      </span>
                      <ChevronDownIcon aria-hidden="true" className="ml-2 h-5 w-5 text-gray-400" />
                    </span>
                  </MenuButton>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                  >
                    <MenuItem>
                      <button
                        onClick={handleOpenProfile}
                        className="block w-full text-left px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                      >
                        Edit Profile
                      </button>
                    </MenuItem>

                    <MenuItem>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                      >
                        Sign Out
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>

        {/* Profile Edit Modal */}
        <ProfileEditSection 
          isOpen={isProfileModalOpen}
          onClose={handleCloseProfile}
        />
      </div>
    </>
  );
}
