export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1>User Dashboard</h1>
      {children}
    </div>
  );
}
