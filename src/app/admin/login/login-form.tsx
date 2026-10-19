"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "./actions";
import { admin as t } from "@/messages/mn";
import { IconEye, IconEyeOff } from "@/components/icons";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/admin/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false);
  // Controlled so a failed attempt (React resets forms after an action) keeps the name.
  const [username, setUsername] = useState("");

  return (
    <form action={action} className="space-y-5" noValidate>
      <div>
        <label htmlFor="username" className={labelClass}>
          {t.login.username}
        </label>
        <input
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          {t.login.password}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${fieldClass} pr-14`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? t.login.hidePassword : t.login.showPassword}
            aria-pressed={show}
            className="absolute inset-y-0 right-0 grid w-14 place-items-center text-ink-2 hover:text-ink"
          >
            {show ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>
      </div>

      <p role="alert" aria-live="polite" className="min-h-6 text-base font-medium text-danger">
        {state.error}
      </p>

      <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full`}>
        {pending ? t.login.submitting : t.login.submit}
      </button>
    </form>
  );
}
