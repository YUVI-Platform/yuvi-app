import { SideNavItemType } from "@/Types/Navigation";
import {
  BarChart,
  Calendar,
  DollarSign,
  Home,
  MessageSquare,
  PlusCircle,
  Search,
  User,
  Users,
} from "feather-icons-react";
const AdminSideNavData: SideNavItemType[] = [
  {
    name: "User Overview",
    href: "/dashboard/admin/useroverview",
    icon: <User className="h-5 w-5 mr-2" />,
  },
  {
    name: "Manage Teams",
    href: "/dashboard/admin/manageteams",
    icon: <Users className="h-5 w-5 mr-2" />,
  },
  {
    name: "Chat",
    href: "/dashboard/chat",
    icon: <Home className="h-5 w-5 mr-2" />,
  },
];

const MotionExpertSideNavData: SideNavItemType[] = [
  {
    name: "My Sessions",
    href: "/dashboard/booking",
    icon: <Calendar className="h-5 w-5 mr-2" />,
  },
  {
    name: "Create Session",
    href: "/dashboard/create",
    icon: <PlusCircle className="h-5 w-5 mr-2" />,
  },
  {
    name: "Earnings",
    href: "/dashboard/earnings",
    icon: <DollarSign className="h-5 w-5 mr-2" />,
  },
  {
    name: "Chat",
    href: "/dashboard/chat",
    icon: <MessageSquare className="h-5 w-5 mr-2" />,
  },
];

const StudioHostSideNavData: SideNavItemType[] = [
  {
    name: "My Bookings",
    href: "/dashboard/booking",
    icon: <Calendar className="h-5 w-5 mr-2" />,
  },
  {
    name: "Host Studio",
    href: "/dashboard/create",
    icon: <PlusCircle className="h-5 w-5 mr-2" />,
  },
  {
    name: "Manage Studio",
    href: "/dashboard/studiohost/mystudios",
    icon: <Home className="h-5 w-5 mr-2" />,
  },
  {
    name: "Earnings",
    href: "/dashboard/earnings",
    icon: <DollarSign className="h-5 w-5 mr-2" />,
  },
  {
    name: "Chat",
    href: "/dashboard/chat",
    icon: <MessageSquare className="h-5 w-5 mr-2" />,
  },
];

const AthleteSideNavData: SideNavItemType[] = [
  {
    name: "My Sessions",
    href: "/dashboard/athlete/mysessions",
    icon: <Calendar className="h-5 w-5 mr-2" />,
  },
  {
    name: "Browse Experts",
    href: "/dashboard/athlete/browseexperts",
    icon: <Search className="h-5 w-5 mr-2" />,
  },
  {
    name: "My Progress",
    href: "/dashboard/athlete/myprogress",
    icon: <BarChart className="h-5 w-5 mr-2" />,
  },
  {
    name: "Chat",
    href: "/dashboard/chat",
    icon: <MessageSquare className="h-5 w-5 mr-2" />,
  },
];

export {
  AthleteSideNavData,
  AdminSideNavData,
  MotionExpertSideNavData,
  StudioHostSideNavData,
};
