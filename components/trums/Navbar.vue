<script lang="ts" setup>
import { useFlowbite } from "~/composables/useFlowbite";
import { ref, onMounted } from "vue";

const { t } = useI18n();
const $screen = useScreen();
const showDrawer = ref(false);
const route = useRoute();

const availableOs = [
  {
    key: "ios",
    text: "iOS",
    to: "https://www.apple.com/ios/app-store/", // URL untuk navigasi eksternal
    icon: "ri:apple-fill",
  },
  {
    key: "android",
    text: "Android",
    to: "https://play.google.com/store/apps", // URL untuk navigasi eksternal
    icon: "uiw:android",
  },
];

const menuSidebar = [
  {
    key: "assets",
    text: "assets",
    to: "/assets-management",
    icon: "fluent:web-asset-16-filled",
    active: route.name === "assets-management",
    child: null,
  },
  {
    key: "contact-management",
    text: "contact",
    icon: "ri:contacts-book-3-fill",
    active: route.name === "contact-management",
    child: [
      {
        text: "contacts",
        to: "/contact-management/contacts",
      },
      {
        text: "categories",
        to: "/contact-management/categories",
      },
    ],
  },
  {
    key: "finance-management",
    text: "finance",
    icon: "carbon:finance",
    active: route.name === "finance-management",
    child: [
      {
        text: "bill",
        to: "/finance-management/bill",
      },
      {
        text: "budget",
        to: "/finance-management/budget",
      },
      {
        text: "invoice",
        to: "/finance-management/invoice",
      },
      {
        text: "transaction",
        to: "/finance-management/transaction",
      },
    ],
  },
  {
    key: "human-capital-management",
    text: "humanCapital",
    icon: "ph:users-three-fill",
    active: route.name === "human-capital-management",
    child: [
      {
        text: "departement",
        to: "/human-capital-management/departement",
      },
      {
        text: "people",
        to: "/human-capital-management/people",
      },
      {
        text: "position",
        to: "/human-capital-management/position",
      },
      {
        text: "recruitment",
        to: "/human-capital-management/recruitment",
      },
    ],
  },
  {
    key: "inspection-maintenance",
    text: "inspect",
    icon: "oui:inspect",
    active: route.name === "inspection-maintenance",
    child: [
      {
        text: "inspection",
        to: "/inspection-maintenance/inspection",
      },
      {
        text: "maintenance",
        to: "/inspection-maintenance/maintenance",
      },
      {
        text: "repair",
        to: "/inspection-maintenance/repair",
      },
    ],
  },
  {
    key: "inventory-management",
    text: "inventory",
    icon: "ic:round-warehouse",
    active: route.name === "inventory-management",
    child: [
      {
        text: "checkin",
        to: "/inventory-management/checkin",
      },
      {
        text: "checkout",
        to: "/inventory-management/checkout",
      },
      {
        text: "inqueiries",
        to: "/inventory-management/inqueiries",
      },
      {
        text: "inventories",
        to: "/inventory-management/inventories",
      },
    ],
  },
  {
    key: "sales",
    text: "sales",
    icon: "mdi:account-tie",
    active: route.name === "sales",
    child: [
      {
        text: "contract",
        to: "/sales/contract",
      },
      {
        text: "order",
        to: "/sales/order",
      },
      {
        text: "pricelist",
        to: "/sales/pricelist",
      },
    ],
  },
  {
    key: "supply-chain-management",
    text: "supplyChain",
    icon: "hugeicons:blockchain-06",
    active: route.name === "supply-chain-management",
    child: [
      {
        text: "canvassing",
        to: "/supply-chain-management/canvassing",
      },
      {
        text: "delivery",
        to: "/supply-chain-management/delivery",
      },
      {
        text: "purchaseOrder",
        to: "/supply-chain-management/purchase/order",
      },
      {
        text: "purchaseRequest",
        to: "/supply-chain-management/purchase/request",
      },
      {
        text: "receive",
        to: "/supply-chain-management/receive",
      },
    ],
  },
];
onMounted(async () => {
  useFlowbite(() => {
    initFlowbite();
  });
});
</script>

<style scoped>
.router-link-active {
  @apply text-primary-500;
}
.router-link-active:hover {
  @apply text-primary-600;
}
</style>

<template>
  <header
    class="flex fixed backdrop-filter backdrop-blur-md top-0 z-40 w-full flex-none transition-colors duration-300 lg:z-50 border-b border-gray-950/10 dark:border-gray-50/[0.2] bg-white/[0.5] dark:bg-gray-950/[0.5] lg:px-10 md:px-6"
  >
    <div
      class="flex-1 flex items-center justify-between w-screen mx-auto px-4"
      v-if="$screen.higherThan('lg', $screen.current.value)"
    >
      <div class="text-center w-full flex gap-2 items-center">
        <TrumsButtons
          type="primary"
          size="sm"
          padding="xs"
          data-drawer-target="drawer-navigation"
          data-drawer-show="drawer-navigation"
          aria-controls="drawer-navigation"
        >
          <Icon name="material-symbols:lists" size="20"></Icon>
        </TrumsButtons>

        <TrumsLink to="/" class="font-bold text-xl flex gap-2 items-center">
          <img
            v-if="$colorMode.value === 'dark'"
            src="/images/logo/logo-white.png"
            alt="logo Trums"
            class="w-9"
          />
          <img
            v-if="$colorMode.value === 'light'"
            src="/images/logo/logo-black.png"
            alt="logo Trums"
            class="w-9"
          />
          <span class="dark:text-white text-black">Trums</span>
        </TrumsLink>
      </div>
      <div
        id="drawer-navigation"
        class="fixed top-0 left-0 z-40 w-64 h-screen p-4 flex flex-col justify-between transition-transform -translate-x-full bg-white dark:bg-gray-800"
        tabindex="-1"
        aria-labelledby="drawer-navigation-label"
      >
        <div class="justify-start flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <TrumsLink to="/" class="font-bold text-xl flex gap-2 items-center">
              <img
                v-if="$colorMode.value === 'dark'"
                src="/images/logo/logo-white.png"
                alt="logo Trums"
                class="w-9"
              />
              <img
                v-if="$colorMode.value === 'light'"
                src="/images/logo/logo-black.png"
                alt="logo Trums"
                class="w-9"
              />
              <span class="dark:text-white text-black">Trums</span>
            </TrumsLink>
            <button
              type="button"
              data-drawer-hide="drawer-navigation"
              aria-controls="drawer-navigation"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                aria-hidden="true"
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span class="sr-only">Close menu</span>
            </button>
          </div>
          <hr class="h-px bg-gray-200 border-0 dark:bg-gray-700" />
        </div>

        <div class="py-2 overflow-y-auto items-start justify-start h-full">
          <ul class="space-y-2 font-medium">
            <li v-for="menu in menuSidebar" :key="menu.key">
              <TrumsButtons
                v-if="menu.child !== null"
                type="sidebar"
                padding="xxs"
                size="sm"
                class="flex items-center w-full text-base transition duration-75 rounded-lg group"
                :aria-controls="menu.key"
                :data-collapse-toggle="menu.key"
              >
                <Icon :name="menu.icon" size="30" />
                <span
                  class="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap"
                  >{{ $t(`menu.${menu.text}`) }}</span
                >
                <Icon
                  name="material-symbols:arrow-drop-down-rounded"
                  size="30"
                />
              </TrumsButtons>
              <ul
                v-if="menu.child !== null"
                :id="menu.key"
                class="hidden py-2 space-y-2"
              >
                <li v-for="subMenu in menu.child" :key="subMenu.text">
                  <TrumsButtons
                    type="sidebar"
                    :to="subMenu.to"
                    size="sm"
                    padding="xxs"
                    position="left"
                    class="w-full transition duration-75 pl-[50px] rounded-lg group hover:bg-gray-100"
                    >{{ $t(`menu.submenu.${subMenu.text}`) }}</TrumsButtons
                  >
                </li>
              </ul>
              <TrumsButtons
                v-else
                type="sidebar"
                padding="xxs"
                size="sm"
                :to="menu.to"
                class="flex items-center w-full text-base transition duration-75 rounded-lg group"
              >
                <Icon :name="menu.icon" size="30" />
                <span
                  class="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap"
                  >{{ $t(`menu.${menu.text}`) }}</span
                >
              </TrumsButtons>
            </li>
          </ul>
        </div>

        <div class="justify-end flex flex-col gap-2">
          <hr class="h-px bg-gray-200 border-0 dark:bg-gray-700" />

          <div class="pb-4 flex justify-between items-center">
            <div class="flex gap-2 items-center">
              <img
                class="rounded-full size-9"
                src="/public/images/default/profile.jpg"
                alt="image description"
              />
              <p>nama akun</p>
            </div>
            <TrumsLink to="setting" class="size-7"
              ><Icon
                name="material-symbols-light:settings"
                class="size-7"
              ></Icon
            ></TrumsLink>
          </div>
        </div>
      </div>
      <div class="flex gap-4 w-full justify-end">
        <div
          class="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse"
        >
          <button
            type="button"
            class="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            id="user-menu-button"
            aria-expanded="false"
            data-dropdown-toggle="navbar-user"
            data-dropdown-placement="bottom"
          >
            <span class="sr-only">Open user menu</span>
            <img
              class="w-8 h-8 rounded-full"
              src="/public/images/default/profile.jpg"
              alt="user photo"
            />
          </button>
          <!-- Dropdown menu -->
          <div
            class="z-50 hidden my-4 mr-2 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600"
            id="navbar-user"
          >
            <div class="px-4 py-3">
              <span class="block text-sm text-gray-900 dark:text-white"
                >Bonnie Green</span
              >
              <span
                class="block text-sm text-gray-500 truncate dark:text-gray-400"
                >name@flowbite.com</span
              >
            </div>
            <ul class="py-2" aria-labelledby="user-menu-button">
              <li>
                <TrumsLink
                  to="setting"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200"
                  >{{ $t("menu.setting") }}</TrumsLink
                >
              </li>
              <li>
                <TrumsLink
                  to="login"
                  class="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-red-600"
                >
                  {{ $t("buttons.logout") }}
                </TrumsLink>
              </li>
            </ul>
          </div>
          <button
            data-collapse-toggle="navbar-user"
            type="button"
            class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-user"
            aria-expanded="false"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        <TrumsSwitcherTheme />
        <TrumsSwitcherLang />
      </div>
    </div>
    <div
      class="flex-1 flex items-center justify-between w-screen mx-auto px-4"
      v-else
    >
      <TrumsLink
        to="/"
        class="font-bold text-xl text-primary-500 flex gap-2 items-center"
      >
        <img
          v-if="$colorMode.value === 'dark'"
          src="/images/logo/logo-white.png"
          alt="logo Trums"
          class="w-9"
        />
        <img
          v-if="$colorMode.value === 'light'"
          src="/images/logo/logo-black.png"
          alt="logo Trums"
          class="w-9"
        />
        <span class="capitalize">Trums</span>
      </TrumsLink>
      <div class="pl-4 flex space-x-3 text-xl">
        <TrumsLink
          class="text-gray-600 dark:text-white hover:text-primary-500"
          @click.prevent="() => (showDrawer = !showDrawer)"
        >
          <Icon name="heroicons:bars-3-bottom-right-20-solid" />
        </TrumsLink>
      </div>
    </div>
    <TrumsSheet
      v-if="!$screen.higherThan('lg', $screen.current.value) && showDrawer"
      @close="() => (showDrawer = false)"
    >
      <TrumsSheetGroup>
        <TrumsSheetHeader>
          <TrumsSheetHeaderTitle text="Menu" />
        </TrumsSheetHeader>
        <!-- dynamic menus -->
        <TrumsSheetItem>
          <div class="flex flex-col text-md items-start gap-2">
            <TrumsLink to=""></TrumsLink>
            <TrumsLink to=""></TrumsLink>
          </div>
        </TrumsSheetItem>
        <TrumsSheetHeader>
          <TrumsSheetHeaderTitle text="Download" />
        </TrumsSheetHeader>
        <TrumsSheetItem
          class="flex flex-row justify-between gap-3 text-sm items-start"
        >
          <a
            v-for="os in availableOs"
            :key="os.key"
            :href="os.to"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full py-1 px-2 flex items-center gap-1 border border-gray-600 justify-center rounded-sm"
          >
            <span class="text-sm items-center flex">
              <Icon :name="os.icon" />
            </span>
            {{ os.text }}
          </a>
        </TrumsSheetItem>
        <TrumsSheetItem class="flex flex-col">
          <div class="flex gap-3 justify-between pb-2">
            <div class="w-full">
              <div class="mt-2 mb-2 text-sm font-bold capitalize">
                Change Theme
              </div>
              <TrumsSwitcherTheme type="select-box" />
            </div>
            <div class="w-full">
              <div class="mt-2 mb-2 text-sm font-bold capitalize">
                Change Language
              </div>
              <TrumsSwitcherLang type="select-box" />
            </div>
          </div>
        </TrumsSheetItem>
      </TrumsSheetGroup>
    </TrumsSheet>
  </header>
</template>
