import {
  FolderOpen,
  Ticket,
  Users,
  CreditCard,
  Scale,
  UserCog,
  AlertTriangle,
  Headphones,
  Settings,
  LayoutDashboard,
} from "lucide-react"

export const navigation = {
  navMain: [
        {
      title: "Dashboard",
      url: "/insights",
      icon: LayoutDashboard,
      isActive: true,
      items: [],
    },
    {
      title: "Application Center",
      url: "#",
      icon: FolderOpen,
      isActive: true,
      items: [
        {
          title: "All Applications",
          url: "/applications",
          badge: "07",
        },
        {
          title: "Active Applications",
          url: "/applications/active",
          badge: "04",
        },
        {
          title: "Pending Applications",
          url: "/applications/pending",
          badge: "02",
        },
        {
          title: "Rejected Applications",
          url: "/applications/rejected",
          badge: "01",
        },
      ],
    },
    {
      title: "Ticket Management",
      url: "#",
      icon: Ticket,
      items: [],
    },
    {
      title: "User Management",
      url: "#",
      icon: Users,
      items: [],
    },
    {
      title: "Payment Center",
      url: "/payments",
      icon: CreditCard,
      items: [],
    },
    {
      title: "Government Updates",
      url: "/government-updates",
      icon: Scale,
      badge: "07",
      items: [],
    },
    {
      title: "Type Management",
      url: "/type-management",
      icon: UserCog,
      items: [],
    },
    {
      title: "Raise An Issue",
      url: "/raise-issue",
      icon: AlertTriangle,
      items: [],
    },
    {
      title: "Support",
      url: "/support",
      icon: Headphones,
      items: [],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [],
    },
  ],
}
