"use client";

import { useState } from "react";
import type { CapabilityGroup } from "@/lib/permissions";
import type { Capability } from "@/generated/prisma/enums";

/**
 * The owner's permission editor: one checkbox per ability, grouped the way
 * the work is grouped. Nothing is implied — an account holds exactly the
 * boxes that are ticked, and unticking one takes effect on the staff
 * member's very next page load.
 */
export function PermissionMatrix({
  groups,
  granted,
  disabled = false,
}: {
  groups: CapabilityGroup[];
  granted: Capability[];
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(granted));

  const toggle = (capability: string, checked: boolean) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (checked) next.add(capability);
      else next.delete(capability);
      return next;
    });
  };

  const toggleGroup = (group: CapabilityGroup, checked: boolean) => {
    setSelected((previous) => {
      const next = new Set(previous);
      for (const item of group.capabilities) {
        if (checked) next.add(item.capability);
        else next.delete(item.capability);
      }
      return next;
    });
  };

  const total = groups.reduce((sum, group) => sum + group.capabilities.length, 0);

  return (
    <div>
      <div className="flex items-center justify-between border-b border-ink-200 bg-ink-50 px-5 py-2.5">
        <p className="text-[0.78rem] font-semibold text-ink-700">
          {selected.size} of {total} permissions granted
        </p>
      </div>

      <ul className="divide-y divide-ink-200">
        {groups.map((group) => {
          const groupAll = group.capabilities.every((item) =>
            selected.has(item.capability),
          );

          return (
            <li key={group.id} className="px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h3 className="font-serif text-[1rem] font-semibold text-ink-900">
                    {group.label}
                  </h3>
                  <p className="mt-0.5 text-[0.78rem] text-ink-500">{group.hint}</p>
                </div>

                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group, !groupAll)}
                    className="text-[0.74rem] font-semibold text-brand-700 underline underline-offset-4"
                  >
                    {groupAll ? "Clear section" : "Select section"}
                  </button>
                ) : null}
              </div>

              <ul className="mt-3 space-y-2.5">
                {group.capabilities.map((item) => {
                  const checked = selected.has(item.capability);

                  return (
                    <li key={item.capability}>
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          name="capabilities"
                          value={item.capability}
                          checked={checked}
                          disabled={disabled}
                          onChange={(event) =>
                            toggle(item.capability, event.target.checked)
                          }
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[#7a1f2b]"
                        />
                        <span>
                          <span className="block text-[0.86rem] font-medium text-ink-800">
                            {item.label}
                          </span>
                          <span className="block text-[0.78rem] leading-snug text-ink-500">
                            {item.description}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
