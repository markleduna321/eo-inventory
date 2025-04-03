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
  Bars3Icon,
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
import { Link } from '@inertiajs/react';

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

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navItems, setNavItems] = useState(navigation);

  const [user, setUser] = useState(null);

  const [isAssetsOpen, setIsAssetsOpen] = useState(false);

  useEffect(() => {
    // Access the user data from the global window object
    if (window.authUser) {
      setUser(window.authUser);
    }
  }, []);

  useEffect(() => {
    const currentPath = window.location.pathname;

    const updatedNavItems = navItems.map((item) => ({
      ...item,
      current: item.href === currentPath,
    }));

    setNavItems(updatedNavItems);
  }, []);

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
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 ring-1 ring-white/10">
                <div className="flex h-16 shrink-0 items-center">
                  <img
                    alt="Your Company"
                    src="/img/logo.jpg"
                    className="h-15 w-full pt-5"
                  />
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col">
                    <li>
                      <a
                        href="#"
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                      >
                        <ChartBarIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                        Dashboard
                      </a>
                    </li>

                    <li>
                      <a
                        href="/admin/user_management"
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                      >
                        <UserGroupIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                        User Management
                      </a>
                    </li>

                    {/* Assets Dropdown */}
                    <li>
                      <button
                        onClick={() => setIsAssetsOpen(!isAssetsOpen)}
                        className="group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                      >
                        <ArchiveBoxIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                        Assets
                        <ChevronDownIcon
                          className={`h-5 w-5 transition-transform duration-200 ${isAssetsOpen ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        />
                      </button>
                      {isAssetsOpen && (
                        <ul className="ml-8 mt-1 space-y-1">
                          <li>
                            <a
                              href="#"
                              className="group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                            >
                              <DevicePhoneMobileIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                              Devices
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                            >
                              <ComputerDesktopIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                              System Units
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                            >
                              <DeviceTabletIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                              Peripherals
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                            >
                              <CogIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                              Parts and Accessories
                            </a>
                          </li>
                        </ul>
                      )}
                    </li>

                    <li>
                      <a
                        href="#"
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                      >
                        <DocumentChartBarIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                        Reports
                      </a>
                    </li>

                    <li>
                      <a
                        href="#"
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                      >
                        <BuildingOffice2Icon aria-hidden="true" className="h-6 w-6 shrink-0" />
                        Stations
                      </a>
                    </li>

                    <li>
                      <a
                        href="#"
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                      >
                        <MapPinIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                        Locations
                      </a>
                    </li>

                    <li className="mt-auto">
                      <a
                        href="#"
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                      >
                        <Cog6ToothIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                        Settings
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <img
                alt="Your Company"
                src="/img/logo.jpg"
                className="h-15 w-full pt-5"
              />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col">
                <li>
                  <a
                    href="/admin/dashboard"
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                  >
                    <ChartBarIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                    Dashboard
                  </a>
                </li>

                <li>
                  <a
                    href="/admin/user_management"
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                  >
                    <UserGroupIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                    User Management
                  </a>
                </li>

                {/* Assets Dropdown */}
                <li>
                  <button
                    onClick={() => setIsAssetsOpen(!isAssetsOpen)}
                    className="group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                  >
                    <ArchiveBoxIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                    Assets
                    <ChevronDownIcon
                      className={`h-5 w-5 transition-transform duration-200 ${isAssetsOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isAssetsOpen && (
                    <ul className="ml-8 mt-1 space-y-1">
                      <li>
                        <a
                          href="#"
                          className="group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                        >
                          <DevicePhoneMobileIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                          Devices
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                        >
                          <ComputerDesktopIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                          System Units
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                        >
                          <DeviceTabletIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                          Peripherals
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="group -mx-2 flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                        >
                          <CogIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                          Parts and Accessories
                        </a>
                      </li>
                    </ul>
                  )}
                </li>

                <li>
                  <a
                    href="#"
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                  >
                    <DocumentChartBarIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                    Reports
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                  >
                    <BuildingOffice2Icon aria-hidden="true" className="h-6 w-6 shrink-0" />
                    Stations
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-black hover:bg-gray-800 hover:text-white"
                  >
                    <MapPinIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                    Locations
                  </a>
                </li>

                <li className="mt-auto">
                  <a
                    href="#"
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    <Cog6ToothIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                    Settings
                  </a>
                </li>
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
                    <UserCircleIcon className=' h-8'/>
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
                    className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                  >
                    {/* {userNavigation.map((item) => (
                      <MenuItem key={item.name}>
                        <Link
                        method="post" href={route('logout')} as="button"
                          className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                        >
                          {item.name}
                        </Link>
                      </MenuItem>
                    ))} */}

                    <MenuItem>
                      <Link
                        method="post" href={route('logout')} as="button"
                        className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                      >
                        Sign Out
                      </Link>
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
      </div>
    </>
  );
}
