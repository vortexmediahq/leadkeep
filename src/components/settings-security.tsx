import { formatDistanceToNow } from "date-fns";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/fields";
import {
  confirmTotpEnrollment,
  deletePasskey,
  listPasskeys,
  listTotpFactors,
  passkeysSupported,
  registerPasskey,
  startTotpEnrollment,
  unenrollTotp,
  type TotpEnrollment,
} from "@/lib/session";
import { fetchRecentLoginEvents, markLoginEventsSeen, UNUSUAL_COPY, type LoginEvent } from "@/lib/security";

type PasskeyItem = { id: string; friendly_name?: string | null; created_at?: string; name?: string };

export function SettingsSecurity() {
  return (
    <section id="security" className="scroll-mt-20 flex flex-col gap-4 rounded-3xl border border-line bg-paper p-4 shadow-panel">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">Sign-in security</h2>
        <p className="mt-1 text-sm text-muted">Extra steps so only you can open your lead inbox.</p>
      </header>
      <TotpSettings />
      <PasskeySettings />
      <UnusualList />
    </section>
  );
}

function TotpSettings() {
  const [factors, setFactors] = useState<{ id: string; friendly_name?: string }[]>([]);
  const [enroll, setEnroll] = useState<TotpEnrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = () => void listTotpFactors().then(setFactors);

  useEffect(() => {
    refresh();
  }, []);

  const start = async () => {
    setPending(true);
    setError("");
    setMessage("");
    try {
      setEnroll(await startTotpEnrollment());
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Couldn't start authenticator setup.");
    } finally {
      setPending(false);
    }
  };

  const confirm = async (event: FormEvent) => {
    event.preventDefault();
    if (!enroll) return;
    setPending(true);
    setError("");
    try {
      await confirmTotpEnrollment(enroll.factorId, code);
      setEnroll(null);
      setCode("");
      setMessage("Authenticator app is on. You'll be asked for a code the next time you log in.");
      refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "That code didn't work.");
    } finally {
      setPending(false);
    }
  };

  const turnOff = async (id: string) => {
    if (!window.confirm("Turn off the authenticator app? You'll only need your password (or fingerprint) to log in.")) return;
    setPending(true);
    setError("");
    try {
      await unenrollTotp(id);
      setMessage("Authenticator app is off.");
      refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "We couldn't turn that off.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line p-4">
      <h3 className="font-semibold">Authenticator app</h3>
      <p className="mt-1 text-sm text-muted">
        After your password, you'll enter a 6-digit code from an app such as Google Authenticator, Authy or 1Password.
      </p>
      {factors.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-won">On</p>
          <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => void turnOff(factors[0].id)}>
            Turn off
          </Button>
        </div>
      ) : enroll ? (
        <form onSubmit={(event) => void confirm(event)} className="mt-4 flex flex-col gap-3">
          <p className="text-sm text-muted">Scan this with your authenticator app, or type the key below.</p>
          <img src={enroll.qrCode} alt="Authenticator QR code" className="size-40 rounded-xl bg-paper object-contain" />
          <p className="break-all font-mono text-xs text-ink-soft">{enroll.secret}</p>
          <Field id="enroll-code" label="Enter the 6-digit code to confirm" error={error}>
            <TextInput id="enroll-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={pending}>{pending ? "Checking…" : "Turn on"}</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => { setEnroll(null); setError(""); }}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" variant="secondary" size="sm" className="mt-3" disabled={pending} onClick={() => void start()}>
          {pending ? "Starting…" : "Set up authenticator"}
        </Button>
      )}
      {error && !enroll ? <p className="mt-2 text-sm text-lost">{error}</p> : null}
      {message ? <p className="mt-2 text-sm text-ink-soft">{message}</p> : null}
    </div>
  );
}

function PasskeySettings() {
  const [items, setItems] = useState<PasskeyItem[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const supported = passkeysSupported();

  const refresh = () =>
    void listPasskeys()
      .then((list) => setItems(list as PasskeyItem[]))
      .catch(() => setItems([]));

  useEffect(() => {
    if (supported) refresh();
  }, [supported]);

  const add = async () => {
    setPending(true);
    setError("");
    setMessage("");
    try {
      await registerPasskey();
      setMessage("This device can now unlock LeadKeep with your fingerprint, face or device PIN.");
      refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "We couldn't add this device.");
    } finally {
      setPending(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Remove fingerprint login from this device?")) return;
    setPending(true);
    setError("");
    try {
      await deletePasskey(id);
      setMessage("Removed.");
      refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "We couldn't remove that.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line p-4">
      <h3 className="font-semibold">Fingerprint or face unlock</h3>
      <p className="mt-1 text-sm text-muted">
        After you have an account, you can unlock LeadKeep with this device's fingerprint, face or PIN. This uses a passkey, which stays on your device.
      </p>
      {!supported ? (
        <p className="mt-3 text-sm text-muted">This browser doesn't support fingerprint or face unlock.</p>
      ) : (
        <>
          {items.length ? (
            <ul className="mt-3 flex flex-col gap-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-mist px-3 py-2 text-sm">
                  <span>{item.friendly_name || item.name || "This device"}</span>
                  <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => void remove(item.id)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No devices added yet.</p>
          )}
          <Button type="button" variant="secondary" size="sm" className="mt-3" disabled={pending} onClick={() => void add()}>
            {pending ? "Waiting for your device…" : "Add this device"}
          </Button>
        </>
      )}
      {error ? <p className="mt-2 text-sm text-lost">{error}</p> : null}
      {message ? <p className="mt-2 text-sm text-ink-soft">{message}</p> : null}
    </div>
  );
}

function UnusualList() {
  const [events, setEvents] = useState<LoginEvent[]>([]);

  useEffect(() => {
    void fetchRecentLoginEvents().then((list) => {
      setEvents(list);
      if (list.some((item) => !item.seenAt)) void markLoginEventsSeen();
    });
  }, []);

  return (
    <div className="rounded-2xl border border-line p-4">
      <h3 className="font-semibold">Unusual activity</h3>
      <p className="mt-1 text-sm text-muted">
        We'll flag a new device, a sign-in from a new time zone, or several failed password attempts. Notices also appear at the top of the app.
      </p>
      {events.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No unusual sign-ins recorded.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {events.map((event) => {
            const copy = event.reason ? UNUSUAL_COPY[event.reason] : null;
            return (
              <li key={event.id} className="rounded-xl bg-mist px-3 py-2 text-sm">
                <p className="font-medium">{copy?.title ?? "Unusual sign-in"}</p>
                <p className="text-muted">
                  {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                  {event.deviceLabel ? ` · ${event.deviceLabel}` : ""}
                  {event.timezone ? ` · ${event.timezone}` : ""}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
