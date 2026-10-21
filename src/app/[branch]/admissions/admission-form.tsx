"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { FieldError, Hint, Input, Label, Select, Textarea } from "@/components/ui/field";
import { submitAdmission, type AdmissionState } from "./actions";

type CourseOption = {
  id: string;
  code: string;
  name: string;
  stream: string;
};

const initialState: AdmissionState = { ok: false };

const CATEGORIES = ["General", "OBC", "SC", "ST", "Category-I", "Minority", "Other"];

const BOARDS = [
  "Karnataka State Board (SSLC)",
  "CBSE",
  "ICSE",
  "NIOS",
  "Other state board",
];

export function AdmissionForm({
  branchSlug,
  courses,
  defaultDistrict,
  defaultState,
}: {
  branchSlug: string;
  courses: CourseOption[];
  defaultDistrict?: string | null;
  defaultState?: string | null;
}) {
  const [state, formAction] = useActionState(submitAdmission, initialState);
  const [courseId, setCourseId] = useState("");

  const errors = state.errors ?? {};
  const selectedCourse = courses.find((course) => course.id === courseId);

  /** What was typed on the previous attempt, used to repopulate the form. */
  const v = (name: string) => state.values?.[name] ?? "";

  return (
    <form
      key={state.attempt ?? 0}
      action={formAction}
      noValidate
      className="space-y-9"
    >
      <input type="hidden" name="branchSlug" value={branchSlug} />
      <input
        type="hidden"
        name="preferredCombination"
        value={selectedCourse?.code ?? ""}
      />

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.message ? (
        <div
          role="alert"
          className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-[0.88rem] text-red-800"
        >
          {state.message}
        </div>
      ) : null}

      <Fieldset
        legend="Course preference"
        hint="Choose the combination you wish to join. You can discuss alternatives with the office later."
      >
        <div className="sm:col-span-2">
          <Label htmlFor="courseId" required>
            Combination applied for
          </Label>
          <Select
            id="courseId"
            name="courseId"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            invalid={Boolean(errors.preferredCombination)}
            required
          >
            <option value="">Select a combination</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} — {course.name}
              </option>
            ))}
          </Select>
          <FieldError message={errors.preferredCombination ?? errors.courseId} />
        </div>
      </Fieldset>

      <Fieldset legend="Student details">
        <div className="sm:col-span-2">
          <Label htmlFor="studentName" required>
            Full name of the student
          </Label>
          <Input
            id="studentName"
            name="studentName" defaultValue={v("studentName")}
            autoComplete="name"
            invalid={Boolean(errors.studentName)}
            required
          />
          <Hint>As printed on the SSLC marks card.</Hint>
          <FieldError message={errors.studentName} />
        </div>

        <div>
          <Label htmlFor="dateOfBirth" required>
            Date of birth
          </Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth" defaultValue={v("dateOfBirth")}
            type="date"
            invalid={Boolean(errors.dateOfBirth)}
            required
          />
          <FieldError message={errors.dateOfBirth} />
        </div>

        <div>
          <Label htmlFor="gender" required>
            Gender
          </Label>
          <Select id="gender" name="gender" defaultValue={v("gender")} invalid={Boolean(errors.gender)} required>
            <option value="">Select</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
          </Select>
          <FieldError message={errors.gender} />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category" defaultValue={v("category")}>
            <option value="">Select</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="religion">Religion</Label>
          <Input id="religion" name="religion" defaultValue={v("religion")} />
        </div>
      </Fieldset>

      <Fieldset legend="Contact details">
        <div>
          <Label htmlFor="phone" required>
            Mobile number
          </Label>
          <Input
            id="phone"
            name="phone" defaultValue={v("phone")}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit number"
            autoComplete="tel-national"
            invalid={Boolean(errors.phone)}
            required
          />
          <Hint>The office will call this number about your application.</Hint>
          <FieldError message={errors.phone} />
        </div>

        <div>
          <Label htmlFor="altPhone">Alternate mobile number</Label>
          <Input
            id="altPhone"
            name="altPhone" defaultValue={v("altPhone")}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            invalid={Boolean(errors.altPhone)}
          />
          <FieldError message={errors.altPhone} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="email" required>
            Email address
          </Label>
          <Input
            id="email"
            name="email" defaultValue={v("email")}
            type="email"
            autoComplete="email"
            invalid={Boolean(errors.email)}
            required
          />
          <FieldError message={errors.email} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="addressLine1" required>
            Address
          </Label>
          <Input
            id="addressLine1"
            name="addressLine1" defaultValue={v("addressLine1")}
            placeholder="House name / number, street"
            autoComplete="address-line1"
            invalid={Boolean(errors.addressLine1)}
            required
          />
          <FieldError message={errors.addressLine1} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="addressLine2">Village / post</Label>
          <Input id="addressLine2" name="addressLine2" defaultValue={v("addressLine2")} autoComplete="address-line2" />
        </div>

        <div>
          <Label htmlFor="city" required>
            Town / city
          </Label>
          <Input
            id="city"
            name="city" defaultValue={v("city")}
            autoComplete="address-level2"
            invalid={Boolean(errors.city)}
            required
          />
          <FieldError message={errors.city} />
        </div>

        <div>
          <Label htmlFor="district">District</Label>
          <Input
            id="district"
            name="district"
            defaultValue={v("district") || defaultDistrict || ""}
          />
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            defaultValue={v("state") || defaultState || ""}
          />
        </div>

        <div>
          <Label htmlFor="pincode">PIN code</Label>
          <Input
            id="pincode"
            name="pincode" defaultValue={v("pincode")}
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
            invalid={Boolean(errors.pincode)}
          />
          <FieldError message={errors.pincode} />
        </div>
      </Fieldset>

      <Fieldset legend="Parent or guardian">
        <div>
          <Label htmlFor="fatherName">Father&rsquo;s name</Label>
          <Input id="fatherName" name="fatherName" defaultValue={v("fatherName")} />
        </div>

        <div>
          <Label htmlFor="motherName">Mother&rsquo;s name</Label>
          <Input id="motherName" name="motherName" defaultValue={v("motherName")} />
        </div>

        <div>
          <Label htmlFor="guardianPhone">Parent / guardian mobile</Label>
          <Input
            id="guardianPhone"
            name="guardianPhone" defaultValue={v("guardianPhone")}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            invalid={Boolean(errors.guardianPhone)}
          />
          <FieldError message={errors.guardianPhone} />
        </div>

        <div>
          <Label htmlFor="guardianOccupation">Occupation</Label>
          <Input id="guardianOccupation" name="guardianOccupation" defaultValue={v("guardianOccupation")} />
        </div>
      </Fieldset>

      <Fieldset legend="Previous education (SSLC / Class 10)">
        <div>
          <Label htmlFor="sslcBoard">Board</Label>
          <Select id="sslcBoard" name="sslcBoard" defaultValue={v("sslcBoard")}>
            <option value="">Select</option>
            {BOARDS.map((board) => (
              <option key={board} value={board}>
                {board}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="sslcSchool">School last attended</Label>
          <Input id="sslcSchool" name="sslcSchool" defaultValue={v("sslcSchool")} />
        </div>

        <div>
          <Label htmlFor="sslcRegisterNo">Register number</Label>
          <Input id="sslcRegisterNo" name="sslcRegisterNo" defaultValue={v("sslcRegisterNo")} />
        </div>

        <div>
          <Label htmlFor="sslcYear">Year of passing</Label>
          <Input
            id="sslcYear"
            name="sslcYear" defaultValue={v("sslcYear")}
            inputMode="numeric"
            maxLength={4}
            placeholder={String(new Date().getFullYear())}
            invalid={Boolean(errors.sslcYear)}
          />
          <FieldError message={errors.sslcYear} />
        </div>

        <div>
          <Label htmlFor="sslcPercentage">Percentage obtained</Label>
          <Input
            id="sslcPercentage"
            name="sslcPercentage" defaultValue={v("sslcPercentage")}
            inputMode="decimal"
            placeholder="e.g. 86.4"
            invalid={Boolean(errors.sslcPercentage)}
          />
          <FieldError message={errors.sslcPercentage} />
        </div>
      </Fieldset>

      <Fieldset legend="Anything else we should know?">
        <div className="sm:col-span-2">
          <Label htmlFor="remarksFromApplicant">Remarks (optional)</Label>
          <Textarea
            id="remarksFromApplicant"
            name="remarksFromApplicant" defaultValue={v("remarksFromApplicant")}
            rows={4}
            placeholder="Transport route required, sibling studying here, and so on."
          />
        </div>
      </Fieldset>

      <div className="border border-ink-200 bg-ink-50 p-5">
        <label className="flex items-start gap-3 text-[0.86rem] text-ink-700">
          <input
            type="checkbox"
            name="consent"
            value="on"
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--branch-color)]"
          />
          <span>
            I confirm that the details given above are true to the best of my
            knowledge, and I agree to the college contacting me about this
            application.
          </span>
        </label>
        <FieldError message={errors.consent} />

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <SubmitButton />
          <p className="text-[0.78rem] text-ink-500">
            Submitting this form does not confirm admission.
          </p>
        </div>
      </div>
    </form>
  );
}

function Fieldset({
  legend,
  hint,
  children,
}: {
  legend: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-t border-ink-200 pt-6">
      <legend className="sr-only">{legend}</legend>
      <h2 className="font-serif text-[1.15rem] font-semibold text-ink-900">
        {legend}
      </h2>
      {hint ? <p className="mt-1 text-[0.82rem] text-ink-500">{hint}</p> : null}

      <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Submitting…" : "Submit application"}
    </Button>
  );
}
