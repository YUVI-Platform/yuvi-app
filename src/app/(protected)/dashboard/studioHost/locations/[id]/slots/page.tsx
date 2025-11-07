import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServerRead } from "@/lib/supabaseServer";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  createSingleSlot,
  createRecurringSlots,
  deleteSlot,
  setBlocked,
} from "./actions";
import ConfirmButton from "./ui/ConfirmButton";
import { RecurSubmitGuard } from "./ui/RecureSubmitGuard";

export default async function SlotsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  if (!me?.user)
    redirect(`/login?redirectTo=/dashboard/studioHost/locations/${id}/slots`); // ← CamelCase

  const uid = me.user.id;

  const { data: loc } = await supa
    .from("studio_locations")
    .select("id,title,owner_user_id,host_user_id,price_per_slot")
    .eq("id", id)
    .maybeSingle();
  if (!loc) redirect("/dashboard/studioHost/locations"); // ← CamelCase

  const canEdit = loc.owner_user_id === uid || loc.host_user_id === uid;
  if (!canEdit) redirect("/dashboard/studioHost/locations"); // ← CamelCase

  const { data: slots } = await supa
    .from("studio_slots")
    .select("id, starts_at, ends_at, capacity, status, allowed_tags")
    .eq("location_id", id)
    .order("starts_at", { ascending: true });

  /* -------- Server-Wrapper für alle Form-Actions -------- */
  async function createSingleSlotAction(formData: FormData): Promise<void> {
    "use server";
    await createSingleSlot(formData);
  }
  async function createRecurringSlotsAction(formData: FormData): Promise<void> {
    "use server";
    await createRecurringSlots(formData);
  }
  async function toggleBlockedAction(formData: FormData): Promise<void> {
    "use server";
    await setBlocked(formData);
  }
  async function deleteSlotAction(formData: FormData): Promise<void> {
    "use server";
    await deleteSlot(formData);
  }

  return (
    <div className="mx-auto max-w-4xl py-4">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Slots verwalten</h1>
          <p className="text-sm text-slate-600">{loc.title}</p>
          <p className="text-xs text-slate-500">
            Preis pro Slot (60 min):{" "}
            <b>
              {Number.isFinite(Number(loc.price_per_slot))
                ? formatEuroCents(loc.price_per_slot)
                : "— (Preis nicht gesetzt)"}
            </b>{" "}
            {!Number.isFinite(Number(loc.price_per_slot)) && (
              <Link
                href={`/dashboard/studioHost/locations/${id}/edit`} // ← CamelCase
                className="ml-2 underline"
              >
                jetzt festlegen
              </Link>
            )}
          </p>
        </div>

        <Link
          href={`/dashboard/studioHost/locations/${id}`} // ← CamelCase
          className="text-sm underline text-slate-600"
        >
          Zurück zur Location
        </Link>
      </div>

      {/* Einzelslot */}
      <section className="mb-6 rounded-xl border bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Einzelnen Slot anlegen (60 min)
        </h2>
        <form
          action={createSingleSlotAction}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <input type="hidden" name="location_id" value={id} />
          <div className="space-y-1">
            <label className="text-sm font-medium">Start</label>
            <input
              name="starts_at"
              type="datetime-local"
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton
              className="rounded-md bg-black px-4 py-2 text-white"
              pendingText="Erstelle…"
            >
              Slot erstellen
            </SubmitButton>
          </div>
        </form>
      </section>

      {/* Wiederkehrende Slots */}
      <section className="mb-6 rounded-xl border bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Wiederkehrende Slots erzeugen (wöchentlich, 60 min)
        </h2>
        <form
          action={createRecurringSlotsAction}
          id="recurForm"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <RecurSubmitGuard formId="recurForm" />
          <input type="hidden" name="location_id" value={id} />
          <div className="space-y-1">
            <label className="text-sm font-medium">Erster Start</label>
            <input
              name="first_starts_at"
              type="datetime-local"
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm font-medium">Wochentage</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((d) => (
                <label
                  key={d}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                >
                  <input
                    type="checkbox"
                    name="byweekday"
                    value={d}
                    className="accent-black"
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Enddatum (optional)</label>
            <input
              name="until_date"
              type="date"
              className="w-full rounded-md border px-3 py-2"
            />
            <p className="mt-1 text-xs text-slate-500">
              Alternativ unten „Anzahl“ angeben.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Anzahl (optional)</label>
            <input
              name="count"
              type="number"
              min={1}
              max={200}
              className="w-full rounded-md border px-3 py-2"
              placeholder="z. B. 12"
            />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton
              className="rounded-md bg-black px-4 py-2 text-white"
              pendingText="Erzeuge…"
            >
              Wiederkehrende Slots erzeugen
            </SubmitButton>
          </div>
        </form>
      </section>

      {/* Liste */}
      <section className="rounded-xl border bg-white">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Vorhandene Slots
          </h2>
        </div>
        <div className="divide-y">
          {(slots ?? []).length === 0 ? (
            <div className="p-4 text-sm text-slate-500">
              Noch keine Slots angelegt.
            </div>
          ) : (
            (slots ?? []).map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-1 items-center gap-3 px-4 py-3 sm:grid-cols-12"
              >
                <div className="sm:col-span-6">
                  <p className="font-medium">
                    {new Date(s.starts_at).toLocaleString()} –{" "}
                    {new Date(s.ends_at).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    60 min • Kapazität: <b>{s.capacity}</b> • Preis:{" "}
                    {formatEuroCents(loc.price_per_slot)}
                  </p>
                </div>
                <div className="sm:col-span-4 text-sm text-slate-600">
                  {Array.isArray(s.allowed_tags) && s.allowed_tags.length
                    ? s.allowed_tags.map((t: string) => `#${t}`).join(" ")
                    : "alle Tags erlaubt"}
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2">
                  <form action={toggleBlockedAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="location_id" value={id} />
                    <input
                      type="hidden"
                      name="blocked"
                      value={(s.status !== "blocked").toString()}
                    />
                    <SubmitButton className="rounded-md border px-3 py-1.5 text-sm">
                      {s.status === "blocked" ? "Freigeben" : "Blockieren"}
                    </SubmitButton>
                  </form>

                  <ConfirmButton
                    label="Löschen"
                    confirmText="Diesen Slot wirklich löschen?"
                    action={deleteSlotAction} // ← echte Server Action referenzieren
                    payload={{ id: s.id, location_id: id }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function formatEuroCents(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "—";
  return `${(n / 100).toFixed(2)}€`;
}
