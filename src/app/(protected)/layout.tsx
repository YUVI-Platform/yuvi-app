import SideNav from "@/components/ui/Navigation/SideNav";
// import { superbase } from "@/utils/supabase/superbaseClient";
// import { redirect } from "next/navigation";

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const {
  //   data: { user },
  // } = await superbase.auth.getUser();
  // console.log("User:", user);
  // if (!user) {
  //   return redirect(process.env.NEXT_PUBLIC_SITE_URL + "/login");
  // }

  return (
    <div className="grid grid-cols-[400px_1fr] bg-indigo-50">
      <SideNav />
      {children}
    </div>
  );
}
