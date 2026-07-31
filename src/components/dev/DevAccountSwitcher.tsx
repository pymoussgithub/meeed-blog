"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { signOutAction, switchDevAccountAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type DevAccount = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CONTRIBUTEUR";
};

type DevAccountSwitcherProps = {
  currentUserId: string | null;
  accounts: DevAccount[];
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

export function DevAccountSwitcher({
  currentUserId,
  accounts,
}: DevAccountSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const redirectTo = useMemo(() => {
    const query = searchParams.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }, [pathname, searchParams]);

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

      if (!shouldOpen) {
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
  }, []);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Switcher de compte"
      className="max-w-xl"
    >
      <div className="space-y-5">
        <p className="text-sm text-primary/70">
          Raccourci: <span className="font-medium text-primary-dark">Ctrl</span>. La page
          courante sera conservée après le switch quand c&apos;est autorisé pour le compte choisi.
        </p>

        <div className="grid gap-2">
          <form action={signOutAction} className="w-full">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <Button type="submit" variant="outline" className="w-full justify-between rounded-2xl px-4 py-3">
              <span>No user</span>
              <span className="text-xs text-primary/55">Aucune session</span>
            </Button>
          </form>

          {accounts.map((account) => {
            const isCurrentAccount = account.id === currentUserId;

            return (
              <form key={account.id} action={switchDevAccountAction} className="w-full">
                <input type="hidden" name="userId" value={account.id} />
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <button
                  type="submit"
                  disabled={isCurrentAccount}
                  className="flex w-full items-center justify-between rounded-2xl border border-primary/10 bg-bg-soft/40 px-4 py-3 text-left transition-colors hover:border-accent/40 hover:bg-bg-soft disabled:cursor-default disabled:border-accent/20 disabled:bg-accent/10"
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
                    <span className="block text-xs text-primary/45">
                      {isCurrentAccount ? "Compte actif" : "Basculer"}
                    </span>
                  </span>
                </button>
              </form>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
