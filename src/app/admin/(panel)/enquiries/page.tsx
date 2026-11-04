import { AdminPageHeader, EmptyState, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Capability } from "@/generated/prisma/enums";
import { toggleEnquiryRead } from "@/lib/actions/content";
import { isDatabaseConfigured } from "@/lib/data/mock-data";
import { branchScopeFilterWithGlobal, requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDateTime, telHref } from "@/lib/utils";

export const metadata = { title: "Enquiries" };

const PER_PAGE = 20;

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireCapability(Capability.CONTACT_VIEW);
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const where = branchScopeFilterWithGlobal(user);

  let messages: any[] = [];
  let total = 0;

  if (!isDatabaseConfigured()) {
    messages = [
      {
        id: "mock_enquiry_1",
        name: "Sunil Kumar",
        phone: "9845112233",
        email: "sunil.k@example.com",
        subject: "Admission inquiry for Science (PCMB) 2025-26",
        message: "Kindly inform regarding hostel facilities and fee structure for PCMB.",
        isRead: false,
        createdAt: new Date(Date.now() - 3600000 * 2),
        branch: { shortName: "Nellikatte Campus" },
      },
      {
        id: "mock_enquiry_2",
        name: "Meenakshi Bhat",
        phone: "9845223344",
        email: "meenakshi@example.com",
        subject: "Bus transport routes near Kabaka",
        message: "Does the college bus cover the Kabaka junction route for morning shifts?",
        isRead: true,
        createdAt: new Date(Date.now() - 86400000 * 2),
        branch: { shortName: "Bappalige Campus" },
      },
    ];
    total = 2;
  } else {
    try {
      const [dbMessages, dbTotal] = await Promise.all([
        prisma.contactMessage.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PER_PAGE,
          take: PER_PAGE,
          include: { branch: { select: { shortName: true } } },
        }),
        prisma.contactMessage.count({ where }),
      ]);
      messages = dbMessages;
      total = dbTotal;
    } catch (err) {
      console.error("Enquiries query error:", err);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Enquiries"
        description="Messages sent through the contact forms on the website."
      />

      <Panel>
        {messages.length === 0 ? (
          <EmptyState
            title="No enquiries yet"
            description="Messages from the website's contact forms will appear here."
          />
        ) : (
          <ul className="divide-y divide-ink-200">
            {messages.map((message) => (
              <li
                key={message.id}
                className={message.isRead ? "px-5 py-4" : "bg-gold-100/40 px-5 py-4"}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-900">
                      {message.name}
                      {!message.isRead ? (
                        <span className="ml-2 align-middle">
                          <Badge tone="gold">New</Badge>
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[0.8rem] text-ink-600">
                      <a
                        href={telHref(message.phone)}
                        className="font-medium text-brand-700 underline underline-offset-4"
                      >
                        {message.phone}
                      </a>
                      {message.email ? (
                        <>
                          {" · "}
                          <a
                            href={`mailto:${message.email}`}
                            className="font-medium text-brand-700 underline underline-offset-4"
                          >
                            {message.email}
                          </a>
                        </>
                      ) : null}
                      {" · "}
                      {message.branch?.shortName ?? "Main site"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[0.76rem] text-ink-500">
                      {formatDateTime(message.createdAt)}
                    </span>
                    <form action={toggleEnquiryRead}>
                      <input type="hidden" name="id" value={message.id} />
                      <button className="text-[0.76rem] font-semibold text-brand-700 underline underline-offset-4">
                        {message.isRead ? "Mark unread" : "Mark read"}
                      </button>
                    </form>
                  </div>
                </div>

                {message.subject ? (
                  <p className="mt-2 text-[0.86rem] font-medium text-ink-800">
                    {message.subject}
                  </p>
                ) : null}

                <p className="mt-1.5 whitespace-pre-line text-[0.88rem] leading-relaxed text-ink-700">
                  {message.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Pagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PER_PAGE))}
        buildHref={(target) =>
          target > 1 ? `/admin/enquiries?page=${target}` : "/admin/enquiries"
        }
      />
    </>
  );
}
