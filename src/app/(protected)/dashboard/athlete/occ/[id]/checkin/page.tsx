import AthleteCheckinClient from "./AthleteCheckinClient";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const code = typeof sp.code === "string" ? sp.code : "";

  return <AthleteCheckinClient occurrenceId={id} initialCode={code} />;
}
