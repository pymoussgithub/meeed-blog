"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import { signOutAction, switchDevAccountAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

type DevAccount = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CONTRIBUTEUR";
};

type AccountsPayload = {
  currentUserId?: string | null;
  accounts?: DevAccount[];
};

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
}

/**
 * Charge comptes + session via API pour ne pas dynamiser le root layout.
 */
export function DevAccountSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<DevAccount[]>([]);
  const [switching, setSwitching] = useState(false);
  const [switchingMessage, setSwitchingMessage] = useState("Changement de compte…");
  const [nudgeAccountId, setNudgeAccountId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expectedUserIdRef = useRef<string | null | undefined>(undefined);
  const loadRequestRef = useRef(0);

  const search = searchParams.toString();
  const redirectTo = useMemo(
    () => `${pathname}${search ? `?${search}` : ""}`,
    [pathname, search],
  );
  const switchingRef = useRef(switching);
  switchingRef.current = switching;

  const applyPayload = useCallback((payload: AccountsPayload) => {
    setCurrentUserId(payload.currentUserId ?? null);
    setAccounts(payload.accounts ?? []);
  }, []);

  const loadAccounts = useCallback(async () => {
    const requestId = ++loadRequestRef.current;
    try {
      const response = await fetch("/api/dev/accounts", { cache: "no-store" });
      if (!response.ok) return null;
      const payload = (await response.json()) as AccountsPayload;
      if (requestId !== loadRequestRef.current) return null;
      applyPayload(payload);
      return payload;
    } catch {
      return null;
    }
  }, [applyPayload]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (nudgeTimerRef.current) {
        clearTimeout(nudgeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [pathname, loadAccounts]);

  // Recharge la liste à chaque ouverture (évite la liste vide si le 1er fetch n'a pas fini).
  useEffect(() => {
    if (!open) return;
    void loadAccounts();
  }, [open, loadAccounts]);

  // Le layout root garde l'état client : fermer le loader dès que l'URL change.
  useEffect(() => {
    if (!switchingRef.current) return;
    expectedUserIdRef.current = undefined;
    setSwitching(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!switching) return;

    const expectedUserId = expectedUserIdRef.current;
    const startedAt = Date.now();
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      expectedUserIdRef.current = undefined;
      setSwitching(false);
      setOpen(false);
      void loadAccounts();
    };

    const tick = async () => {
      const payload = await loadAccounts();
      if (cancelled || !payload) return;

      const nextUserId = payload.currentUserId ?? null;
      if (expectedUserId !== undefined && nextUserId === expectedUserId) {
        finish();
        return;
      }

      if (Date.now() - startedAt > 12_000) {
        finish();
      }
    };

    const interval = setInterval(() => {
      void tick();
    }, 350);

    void tick();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [switching, loadAccounts]);

  useEffect(() => {
    let controlPressedAlone = false;
    let controlTarget: EventTarget | null = null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Control") {
        if (event.repeat) {
          return;
        }

        controlPressedAlone = true;
        controlTarget = event.target;
        return;
      }

      if (event.ctrlKey) {
        controlPressedAlone = false;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key !== "Control") {
        return;
      }

      const shouldOpen = controlPressedAlone && !isTypingTarget(controlTarget ?? event.target);
      controlPressedAlone = false;
      controlTarget = null;

      if (!shouldOpen || switching) {
        return;
      }

      event.preventDefault();
      setOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [switching]);

  const startSwitch = (message: string, expectedUserId: string | null) => {
    expectedUserIdRef.current = expectedUserId;
    setSwitchingMessage(message);
    setSwitching(true);
  };

  const nudgeActiveAccount = (accountId: string) => {
    if (nudgeTimerRef.current) {
      clearTimeout(nudgeTimerRef.current);
    }

    setNudgeAccountId(null);
    requestAnimationFrame(() => {
      setNudgeAccountId(accountId);
      nudgeTimerRef.current = setTimeout(() => {
        setNudgeAccountId(null);
        nudgeTimerRef.current = null;
      }, 420);
    });
  };

  return (
    <>
      <Modal
        open={open && !switching}
        onClose={() => {
          if (!switching) setOpen(false);
        }}
        title="Switcher de compte"
        className="max-w-xl"
      >
        <div className="space-y-5">
          <p className="text-sm text-primary/70">
            Raccourci: <span className="font-medium text-primary-dark">Ctrl</span>. La page
            courante sera conservée après le switch quand c&apos;est autorisé pour le compte choisi.
          </p>

          <div className="grid gap-2">
            <form
              action={signOutAction}
              className="w-full"
              onSubmit={() => startSwitch("Déconnexion…", null)}
            >
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <Button
                type="submit"
                variant="outline"
                className="w-full justify-between rounded-2xl px-4 py-3"
              >
                <span>No user</span>
                <span className="text-xs text-primary/55">Aucune session</span>
              </Button>
            </form>

            {accounts.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-primary/15 px-4 py-3 text-sm text-primary/55">
                Chargement des comptes…
              </p>
            ) : null}

            {accounts.map((account) => {
              const isCurrentAccount = account.id === currentUserId;
              const isNudging = nudgeAccountId === account.id;

              if (isCurrentAccount) {
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => nudgeActiveAccount(account.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-left",
                      isNudging && "animate-account-nudge ring-2 ring-accent/50",
                    )}
                  >
                    <span>
                      <span className="block text-sm font-semibold text-primary-dark">
                        {account.name}
                      </span>
                      <span className="block text-xs text-primary/60">{account.email}</span>
                    </span>
                    <span className="text-right">
                      <span className="block text-xs font-medium text-primary/60">
                        {account.role === "ADMIN" ? "Admin" : "Contributeur"}
                      </span>
                      <span className="block text-xs text-primary/45">Compte actif</span>
                    </span>
                  </button>
                );
              }

              return (
                <form
                  key={account.id}
                  action={switchDevAccountAction}
                  className="w-full"
                  onSubmit={() =>
                    startSwitch(`Connexion en tant que ${account.name}…`, account.id)
                  }
                >
                  <input type="hidden" name="userId" value={account.id} />
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <button
                    type="submit"
                    className="flex w-full items-center justify-between rounded-2xl border border-primary/10 bg-bg-soft/40 px-4 py-3 text-left transition-colors hover:border-accent/40 hover:bg-bg-soft"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-primary-dark">
                        {account.name}
                      </span>
                      <span className="block text-xs text-primary/60">{account.email}</span>
                    </span>
                    <span className="text-right">
                      <span className="block text-xs font-medium text-primary/60">
                        {account.role === "ADMIN" ? "Admin" : "Contributeur"}
                      </span>
                      <span className="block text-xs text-primary/45">Basculer</span>
                    </span>
                  </button>
                </form>
              );
            })}
          </div>
        </div>
      </Modal>

      {mounted && switching
        ? createPortal(
            <div
              className="fixed inset-0 z-[110] flex items-center justify-center p-4"
              role="alertdialog"
              aria-busy="true"
              aria-live="assertive"
              aria-labelledby="dev-switch-loading-title"
            >
              <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]" />
              <div className="relative z-10 flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl border border-gray-200 bg-white px-8 py-7 shadow-2xl">
                <Spinner size="lg" />
                <p
                  id="dev-switch-loading-title"
                  className="text-center text-sm font-semibold text-primary-dark"
                >
                  {switchingMessage}
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
