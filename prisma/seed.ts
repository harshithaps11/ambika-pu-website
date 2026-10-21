/**
 * Development / first-run seed.
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  EVERY NAME, NUMBER AND PARAGRAPH BELOW IS PLACEHOLDER CONTENT.
 *  It is structured exactly like the real thing so the site can be reviewed,
 *  but it must be replaced with the college's own details before launch.
 *  Replace it through the admin panel — no code changes are needed.
 * ───────────────────────────────────────────────────────────────────────────
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  Capability,
  Gender,
  NewsCategory,
  Role,
  Stream,
} from "../src/generated/prisma/enums";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL ?? "owner@ambikapucollege.edu.in";
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD ?? "ChangeMe@Owner2026";
const STAFF_EMAIL = process.env.SEED_STAFF_EMAIL ?? "office@ambikapucollege.edu.in";
const STAFF_PASSWORD = process.env.SEED_STAFF_PASSWORD ?? "ChangeMe@Office2026";

const ACADEMIC_YEAR = "2025–26";

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(9, 30, 0, 0);
  return date;
}

function daysAhead(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  console.log("Seeding Ambika PU College…");

  // ---------------------------------------------------------------- branches
  const nellikatte = await prisma.branch.upsert({
    where: { slug: "nellikatte" },
    update: {},
    create: {
      slug: "nellikatte",
      name: "Ambika Padavi Poorva College, Nellikatte",
      shortName: "Nellikatte Campus",
      tagline: "Science & Commerce",
      about:
        "The Nellikatte campus is the founding campus of the institution, offering Science and Commerce combinations under the Karnataka Pre-University Board. It is known for well-equipped laboratories, a disciplined academic culture and consistently strong board results.",
      establishedYear: 2014,
      affiliation:
        "Affiliated to the Department of Pre-University Education, Government of Karnataka",
      collegeCode: "PLACEHOLDER-01",
      addressLine1: "Ramakrishna Ashram Road",
      addressLine2: "Nellikatte",
      city: "Puttur",
      district: "Dakshina Kannada",
      state: "Karnataka",
      pincode: "574201",
      phone: "08251230001",
      email: "nellikatte@ambikapucollege.edu.in",
      whatsappNo: "919900000001",
      principalName: "Smt. Shobha Rai",
      principalMessage:
        "Our aim at Ambika has always been simple: to help every student who walks through our gate leave as a capable, confident and considerate young adult. The two years of pre-university education are short, and they decide a great deal. We therefore insist on regular attendance, honest work and respect for teachers and classmates alike.\n\nOur teachers are available beyond class hours, our laboratories are open for practice, and our records of past board results are there for any parent to see. I invite you to visit the campus, meet the staff and decide for yourself.",
      themeColor: "#7A1F2B",
      admissionOpen: true,
      admissionNote:
        "Applications for the first year PUC are accepted online. Shortlisted applicants will be contacted by the office for document verification.",
      orderIndex: 0,
    },
  });

  const bappalige = await prisma.branch.upsert({
    where: { slug: "bappalige" },
    update: {},
    create: {
      slug: "bappalige",
      name: "Ambika Padavi Poorva College, Bappalige",
      shortName: "Bappalige Campus",
      tagline: "Science & Commerce",
      about:
        "The Bappalige campus serves students from the surrounding rural panchayats, with transport on all major routes. It offers Science and Commerce combinations with smaller class sizes and a strong focus on first-generation learners.",
      establishedYear: 2018,
      affiliation:
        "Affiliated to the Department of Pre-University Education, Government of Karnataka",
      collegeCode: "PLACEHOLDER-02",
      addressLine1: "Bappalige",
      addressLine2: "Kabaka Post",
      city: "Puttur",
      district: "Dakshina Kannada",
      state: "Karnataka",
      pincode: "574203",
      phone: "08251230002",
      email: "bappalige@ambikapucollege.edu.in",
      whatsappNo: "919900000002",
      principalName: "Sri. Ganesh Bhat",
      principalMessage:
        "A college in a rural setting carries an additional responsibility: for many of our students, we are the first institution in the family to offer higher secondary education. We take that seriously.\n\nSmall classes let our lecturers know every student by name and track each one's progress through the year. Remedial classes run through the week for students who need them, and our transport reaches every major route in the taluk.",
      themeColor: "#14532D",
      admissionOpen: true,
      admissionNote:
        "Admission to both Science and Commerce is open. Transport facility is available on all major routes.",
      orderIndex: 1,
    },
  });

  const branches = [nellikatte, bappalige];
  console.log(`  branches: ${branches.length}`);

  // ----------------------------------------------------------------- courses
  const courseSeed = [
    {
      branchId: nellikatte.id,
      code: "PCMB",
      name: "Physics, Chemistry, Mathematics, Biology",
      stream: Stream.SCIENCE,
      subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
      description:
        "The standard route for students aiming at medical, engineering, agriculture and allied science courses. Keeps both the medical and engineering entrance options open.",
      eligibility: "Pass in SSLC / CBSE Class 10 or equivalent, with Science and Mathematics.",
      intake: 60,
      annualFee: 24000,
      orderIndex: 0,
    },
    {
      branchId: nellikatte.id,
      code: "PCMC",
      name: "Physics, Chemistry, Mathematics, Computer Science",
      stream: Stream.SCIENCE,
      subjects: ["Physics", "Chemistry", "Mathematics", "Computer Science"],
      description:
        "Suited to students heading for engineering, computer applications and the data and software fields.",
      eligibility: "Pass in SSLC / CBSE Class 10 or equivalent, with Science and Mathematics.",
      intake: 60,
      annualFee: 26000,
      orderIndex: 1,
    },
    {
      branchId: nellikatte.id,
      code: "SEBA",
      name: "Statistics, Economics, Business Studies, Accountancy",
      stream: Stream.COMMERCE,
      subjects: ["Statistics", "Economics", "Business Studies", "Accountancy"],
      description:
        "The analytical commerce combination, preferred by students planning B.Com, BBA, CA Foundation and banking careers.",
      eligibility: "Pass in SSLC / CBSE Class 10 or equivalent.",
      intake: 80,
      annualFee: 18000,
      orderIndex: 2,
    },
    {
      branchId: nellikatte.id,
      code: "CEBA",
      name: "Computer Science, Economics, Business Studies, Accountancy",
      stream: Stream.COMMERCE,
      subjects: ["Computer Science", "Economics", "Business Studies", "Accountancy"],
      description:
        "Commerce with a computing component, for students interested in business analytics and information systems.",
      eligibility: "Pass in SSLC / CBSE Class 10 or equivalent.",
      intake: 60,
      annualFee: 20000,
      orderIndex: 3,
    },
    {
      branchId: bappalige.id,
      code: "PCMB",
      name: "Physics, Chemistry, Mathematics, Biology",
      stream: Stream.SCIENCE,
      subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
      description:
        "Science combination with laboratory work in all four subjects and weekly remedial sessions.",
      eligibility: "Pass in SSLC / CBSE Class 10 or equivalent, with Science and Mathematics.",
      intake: 40,
      annualFee: 22000,
      orderIndex: 0,
    },
    {
      branchId: bappalige.id,
      code: "PCMC",
      name: "Physics, Chemistry, Mathematics, Computer Science",
      stream: Stream.SCIENCE,
      subjects: ["Physics", "Chemistry", "Mathematics", "Computer Science"],
      description:
        "Engineering-oriented science combination with a dedicated computer laboratory.",
      eligibility: "Pass in SSLC / CBSE Class 10 or equivalent, with Science and Mathematics.",
      intake: 40,
      annualFee: 24000,
      orderIndex: 1,
    },
    {
      branchId: bappalige.id,
      code: "SEBA",
      name: "Statistics, Economics, Business Studies, Accountancy",
      stream: Stream.COMMERCE,
      subjects: ["Statistics", "Economics", "Business Studies", "Accountancy"],
      description:
        "Commerce combination with commercial practice sessions and training in accounting software.",
      eligibility: "Pass in SSLC / CBSE Class 10 or equivalent.",
      intake: 60,
      annualFee: 16000,
      orderIndex: 2,
    },
  ];

  for (const course of courseSeed) {
    await prisma.course.upsert({
      where: { branchId_code: { branchId: course.branchId, code: course.code } },
      update: {},
      create: course,
    });
  }
  console.log(`  courses: ${courseSeed.length}`);

  // ----------------------------------------------------------------- faculty
  const facultySeed = [
    [nellikatte.id, "Smt. Shobha Rai", "Principal", "Administration", "M.Sc., B.Ed. (Chemistry)", 22],
    [nellikatte.id, "Sri. Ramachandra Bhat", "Lecturer in Physics", "Science", "M.Sc. (Physics), B.Ed.", 15],
    [nellikatte.id, "Smt. Vinaya Kamath", "Lecturer in Chemistry", "Science", "M.Sc. (Chemistry)", 11],
    [nellikatte.id, "Sri. Suresh Nayak", "Lecturer in Mathematics", "Science", "M.Sc. (Mathematics), B.Ed.", 18],
    [nellikatte.id, "Smt. Jayanthi Shetty", "Lecturer in Biology", "Science", "M.Sc. (Botany)", 9],
    [nellikatte.id, "Sri. Prakash Hegde", "Lecturer in Accountancy", "Commerce", "M.Com., B.Ed.", 14],
    [nellikatte.id, "Smt. Deepa Prabhu", "Lecturer in Business Studies", "Commerce", "M.Com.", 7],
    [nellikatte.id, "Sri. Harish Acharya", "Lecturer in Computer Science", "Computer Science", "MCA", 6],
    [bappalige.id, "Sri. Ganesh Bhat", "Principal", "Administration", "M.A., M.Ed. (Economics)", 20],
    [bappalige.id, "Smt. Latha Poojary", "Lecturer in Physics", "Science", "M.Sc. (Physics)", 8],
    [bappalige.id, "Sri. Nagaraj Gowda", "Lecturer in Mathematics", "Science", "M.Sc. (Mathematics), B.Ed.", 12],
    [bappalige.id, "Smt. Sunitha Rao", "Lecturer in Chemistry", "Science", "M.Sc. (Chemistry), B.Ed.", 10],
    [bappalige.id, "Sri. Vasanth Kumar", "Lecturer in Economics", "Commerce", "M.A. (Economics)", 13],
    [bappalige.id, "Smt. Rekha Shenoy", "Lecturer in Accountancy", "Commerce", "M.Com.", 5],
  ] as const;

  const existingFaculty = await prisma.faculty.count();
  if (existingFaculty === 0) {
    await prisma.faculty.createMany({
      data: facultySeed.map(([branchId, name, designation, department, qualification, years], index) => ({
        branchId,
        name,
        designation,
        department,
        qualification,
        experienceYears: years,
        orderIndex: index,
      })),
    });
  }
  console.log(`  faculty: ${facultySeed.length}`);

  // ----------------------------------------------------------------- toppers
  const topperSeed = [
    [nellikatte.id, "Ananya Shetty", Stream.SCIENCE, 97.5, "College First"],
    [nellikatte.id, "Rohan Kamath", Stream.SCIENCE, 96.33, null],
    [nellikatte.id, "Shreya Bhat", Stream.COMMERCE, 96.0, "Commerce First"],
    [nellikatte.id, "Nikhil Rai", Stream.COMMERCE, 94.66, null],
    [bappalige.id, "Praveen Gowda", Stream.SCIENCE, 95.16, "College First"],
    [bappalige.id, "Divya Poojary", Stream.COMMERCE, 94.5, "Commerce First"],
    [bappalige.id, "Manoj Naik", Stream.SCIENCE, 93.0, null],
    [bappalige.id, "Sanjana Rao", Stream.COMMERCE, 92.33, null],
  ] as const;

  const existingToppers = await prisma.topper.count();
  if (existingToppers === 0) {
    await prisma.topper.createMany({
      data: topperSeed.map(([branchId, studentName, stream, percentage, rankLabel], index) => ({
        branchId,
        studentName,
        stream,
        percentage,
        rankLabel,
        academicYear: ACADEMIC_YEAR,
        marksObtained: Math.round((percentage / 100) * 600),
        totalMarks: 600,
        orderIndex: index,
      })),
    });
  }
  console.log(`  toppers: ${topperSeed.length}`);

  // -------------------------------------------------------------------- news
  const newsSeed: Array<{
    branchId: string | null;
    title: string;
    category: NewsCategory;
    summary: string;
    body?: string;
    isTicker?: boolean;
    isPinned?: boolean;
    publishedAt: Date;
    expiresAt?: Date | null;
  }> = [
    {
      branchId: null,
      title: `Admissions open for First Year PUC ${ACADEMIC_YEAR} at both campuses`,
      category: NewsCategory.NOTICE,
      summary:
        "Online applications are now being accepted for Science and Commerce combinations at the Nellikatte and Bappalige campuses.",
      body: "Applications for the first year of the Pre-University course are now open at both campuses.\n\nApply online through the Admissions page of the campus you wish to join. After you submit the form, the office will contact you on the phone number you provide to arrange document verification.\n\nCandidates should keep their SSLC marks card, transfer certificate, caste and income certificates (where applicable), and four passport-size photographs ready at the time of verification.",
      isTicker: true,
      isPinned: true,
      publishedAt: daysAgo(2),
      expiresAt: daysAhead(90),
    },
    {
      branchId: null,
      title: `Second PUC results ${ACADEMIC_YEAR}: institution records 98.2% pass rate`,
      category: NewsCategory.RESULT,
      summary:
        "Both campuses together recorded a pass percentage of 98.2, with 41 students scoring above 90%.",
      isTicker: true,
      publishedAt: daysAgo(9),
    },
    {
      branchId: nellikatte.id,
      title: "Revised timetable for the second term examinations",
      category: NewsCategory.CIRCULAR,
      summary:
        "The second term examination timetable has been revised. The examinations will now begin one week later than originally notified.",
      isTicker: true,
      publishedAt: daysAgo(4),
      expiresAt: daysAhead(30),
    },
    {
      branchId: nellikatte.id,
      title: "Science exhibition and investigatory project display",
      category: NewsCategory.EVENT,
      summary:
        "Students of the Science stream will present their investigatory projects in the college hall. Parents are welcome.",
      publishedAt: daysAgo(14),
    },
    {
      branchId: nellikatte.id,
      title: "Industrial visit for Commerce students to a co-operative bank",
      category: NewsCategory.NEWS,
      summary:
        "Second year Commerce students visited a local co-operative bank as part of their Business Studies coursework.",
      publishedAt: daysAgo(21),
    },
    {
      branchId: bappalige.id,
      title: "College bus route revision for the Kabaka and Bannur routes",
      category: NewsCategory.NOTICE,
      summary:
        "Timings on the Kabaka and Bannur routes have been revised by fifteen minutes with effect from Monday.",
      isTicker: true,
      publishedAt: daysAgo(3),
      expiresAt: daysAhead(45),
    },
    {
      branchId: bappalige.id,
      title: "Remedial classes for first year students begin this month",
      category: NewsCategory.CIRCULAR,
      summary:
        "Subject-wise remedial classes will be conducted after regular college hours on Tuesdays and Thursdays.",
      publishedAt: daysAgo(11),
    },
    {
      branchId: null,
      title: "Annual day celebrations and prize distribution",
      category: NewsCategory.EVENT,
      summary:
        "The annual day will be held at the Nellikatte campus. Students from both campuses will take part in the cultural programme.",
      isTicker: true,
      publishedAt: daysAgo(18),
    },
    {
      branchId: null,
      title: "Students win inter-collegiate quiz at the taluk level",
      category: NewsCategory.ACHIEVEMENT,
      summary:
        "A team from the institution won first place in the taluk-level inter-collegiate quiz competition.",
      publishedAt: daysAgo(26),
    },
    {
      branchId: nellikatte.id,
      title: "Scholarship application window for SC/ST and OBC students",
      category: NewsCategory.NOTICE,
      summary:
        "Eligible students should submit their scholarship applications through the office before the last date.",
      isTicker: true,
      publishedAt: daysAgo(6),
      expiresAt: daysAhead(20),
    },
    {
      branchId: null,
      title: "National Science Day observed at both campuses",
      category: NewsCategory.NEWS,
      summary:
        "Lectures, poster presentations and demonstrations were organised to mark National Science Day.",
      publishedAt: daysAgo(33),
    },
    {
      branchId: bappalige.id,
      title: "Blood donation camp in association with the local primary health centre",
      category: NewsCategory.EVENT,
      summary:
        "Staff and second year students participated in a voluntary blood donation camp held on the campus.",
      publishedAt: daysAgo(40),
    },
  ];

  for (const item of newsSeed) {
    const slug = item.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 70);

    await prisma.newsItem.upsert({
      where: { slug },
      update: {},
      create: {
        branchId: item.branchId,
        title: item.title,
        slug,
        category: item.category,
        summary: item.summary,
        body: item.body ?? item.summary,
        isTicker: item.isTicker ?? false,
        isPinned: item.isPinned ?? false,
        publishedAt: item.publishedAt,
        expiresAt: item.expiresAt ?? null,
      },
    });
  }
  console.log(`  news: ${newsSeed.length}`);

  // ------------------------------------------------------------ hero, stats
  if ((await prisma.heroSlide.count()) === 0) {
    await prisma.heroSlide.createMany({
      data: [
        {
          branchId: null,
          imageUrl: "/images/campus-1.svg",
          headline: "Pre-university education rooted in values",
          subtext:
            "Science and Commerce combinations at two campuses in Puttur, affiliated to the Department of Pre-University Education, Government of Karnataka.",
          ctaLabel: "Explore our campuses",
          ctaUrl: "/#campuses",
          orderIndex: 0,
        },
        {
          branchId: null,
          imageUrl: "/images/campus-2.svg",
          headline: `98.2% pass rate in the ${ACADEMIC_YEAR} board examinations`,
          subtext:
            "Forty-one students scored above ninety per cent across the two campuses.",
          ctaLabel: "See our results",
          ctaUrl: "/news?category=RESULT",
          orderIndex: 1,
        },
        {
          branchId: null,
          imageUrl: "/images/campus-4.svg",
          headline: "Admissions open for the new academic year",
          subtext: "Apply online to the campus of your choice in a few minutes.",
          ctaLabel: "Apply online",
          ctaUrl: "/#campuses",
          orderIndex: 2,
        },
        {
          branchId: nellikatte.id,
          imageUrl: "/images/campus-1.svg",
          headline: "Ambika PU College, Nellikatte",
          subtext:
            "Science and Commerce combinations with well-equipped laboratories and a disciplined academic culture.",
          ctaLabel: "Apply online",
          ctaUrl: "/nellikatte/admissions",
          orderIndex: 0,
        },
        {
          branchId: nellikatte.id,
          imageUrl: "/images/campus-3.svg",
          headline: "Laboratories open beyond class hours",
          subtext: "Practice sessions in Physics, Chemistry and Biology every week.",
          orderIndex: 1,
        },
        {
          branchId: bappalige.id,
          imageUrl: "/images/campus-4.svg",
          headline: "Ambika PU College, Bappalige",
          subtext:
            "Smaller classes, remedial support and college transport on every major route in the taluk.",
          ctaLabel: "Apply online",
          ctaUrl: "/bappalige/admissions",
          orderIndex: 0,
        },
        {
          branchId: bappalige.id,
          imageUrl: "/images/campus-2.svg",
          headline: "Support for first-generation learners",
          subtext: "Remedial classes on Tuesdays and Thursdays through the year.",
          orderIndex: 1,
        },
      ],
    });
  }

  if ((await prisma.statItem.count()) === 0) {
    await prisma.statItem.createMany({
      data: [
        { branchId: null, label: "Students on roll", value: 1180, suffix: "+", orderIndex: 0 },
        { branchId: null, label: "Teaching staff", value: 46, orderIndex: 1 },
        { branchId: null, label: "Years of service", value: new Date().getFullYear() - 2014, orderIndex: 2 },
        { branchId: null, label: "Board pass rate", value: 98, suffix: "%", orderIndex: 3 },
        { branchId: nellikatte.id, label: "Students on roll", value: 760, orderIndex: 0 },
        { branchId: nellikatte.id, label: "Teaching staff", value: 28, orderIndex: 1 },
        { branchId: nellikatte.id, label: "Combinations", value: 4, orderIndex: 2 },
        { branchId: nellikatte.id, label: "Board pass rate", value: 99, suffix: "%", orderIndex: 3 },
        { branchId: bappalige.id, label: "Students on roll", value: 420, orderIndex: 0 },
        { branchId: bappalige.id, label: "Teaching staff", value: 18, orderIndex: 1 },
        { branchId: bappalige.id, label: "Combinations", value: 3, orderIndex: 2 },
        { branchId: bappalige.id, label: "Board pass rate", value: 97, suffix: "%", orderIndex: 3 },
      ],
    });
  }

  if ((await prisma.facility.count()) === 0) {
    const facilities = [
      ["Library & reading room", "Reference books, competitive examination material and daily newspapers, with a separate silent reading area."],
      ["Science laboratories", "Separate Physics, Chemistry and Biology laboratories equipped to the Pre-University Board syllabus."],
      ["Computer laboratory", "Networked computers with internet access for Computer Science practicals and project work."],
      ["Sports & games", "Playground for cricket, volleyball, throwball and kho-kho, with coaching for inter-collegiate teams."],
      ["College transport", "Buses covering the major routes in and around the taluk, with fixed morning and evening timings."],
      ["Career guidance cell", "Counselling for CET, NEET, CA Foundation and degree admissions, with periodic parent interaction."],
    ];

    for (const [branchId] of [[null], [nellikatte.id], [bappalige.id]] as const) {
      await prisma.facility.createMany({
        data: facilities.map(([title, description], index) => ({
          branchId,
          title,
          description,
          orderIndex: index,
        })),
      });
    }
  }

  // ----------------------------------------------------------- page content
  const pages: Array<[string | null, string, string, string]> = [
    [
      null,
      "welcome",
      `Welcome to ${"Ambika Padavi Poorva College"}`,
      "Ambika Padavi Poorva College is a pre-university institution in Puttur, Dakshina Kannada, offering Science and Commerce combinations under the Karnataka Pre-University Board. The institution runs two campuses — at Nellikatte and at Bappalige — each with its own faculty, laboratories and admission office.\n\nWhat the two campuses share is an approach: small enough classes that no student goes unnoticed, teachers who stay back for those who need extra help, and an insistence on regular attendance and honest work. Our board results over the last decade reflect that approach rather than any shortcut.\n\nParents are welcome to visit either campus during working hours, meet the principal and the subject lecturers, and see the facilities for themselves before deciding.",
    ],
    [
      null,
      "management-message",
      "Nattoja Foundation Trust",
      "The Trust established this institution with one conviction: that a young person from any background in this taluk should be able to receive a sound pre-university education close to home, without having to move to a city.\n\nEverything the Trust has built since — the laboratories, the library, the transport network and the second campus at Bappalige — follows from that conviction. We remain committed to keeping fees within reach of ordinary families while refusing to compromise on the quality of teaching.",
    ],
    [
      null,
      "about",
      "About the Institution",
      "Ambika Padavi Poorva College was established in 2014 under the Nattoja Foundation Trust to provide pre-university education to students in and around Puttur taluk, Dakshina Kannada.\n\nThe institution is affiliated to the Department of Pre-University Education, Government of Karnataka, and prepares students for the First and Second PUC board examinations in the Science and Commerce streams.\n\nFrom a single campus at Nellikatte, the institution has grown to two campuses, the second at Bappalige, together serving over a thousand students with a teaching staff of forty-six.",
    ],
    [
      null,
      "vision-mission",
      "Vision & Mission",
      "**Vision**\n\nTo be an institution where students from every background in the region receive a pre-university education that prepares them equally for higher study and for responsible citizenship.\n\n**Mission**\n\nTo teach the prescribed syllabus thoroughly and honestly, with laboratory and practical work given its proper place.\n\nTo identify students who are falling behind early in the year and give them structured remedial support rather than leaving them to manage alone.\n\nTo keep fees affordable and to ensure that no student eligible for a government scholarship misses it for want of guidance.\n\nTo maintain an atmosphere of discipline, punctuality and mutual respect on both campuses.",
    ],
  ];

  // A compound unique key cannot be looked up with a null component, so
  // institution-wide blocks (branchId = null) are matched with findFirst.
  for (const [branchId, key, title, body] of pages) {
    const existing = await prisma.pageContent.findFirst({
      where: { branchId, key },
      select: { id: true },
    });

    if (!existing) {
      await prisma.pageContent.create({ data: { branchId, key, title, body } });
    }
  }

  // -------------------------------------------------------------------- FAQs
  if ((await prisma.faqEntry.count()) === 0) {
    await prisma.faqEntry.createMany({
      data: [
        {
          question: "How do I apply for admission?",
          answer:
            "Open the Admissions page of the campus you want to join and fill the online application form. After you submit it, the office will call you on the number you provide to arrange document verification.",
          keywords: ["apply", "admission", "application", "form", "join", "register", "enroll", "enrol"],
          category: "Admissions",
          orderIndex: 0,
        },
        {
          question: "What documents are needed at the time of admission?",
          answer:
            "SSLC or Class 10 marks card (original and two copies), transfer certificate, conduct certificate, caste and income certificates where applicable, Aadhaar copy, and four passport-size photographs.",
          keywords: ["documents", "certificate", "marks card", "tc", "transfer", "aadhaar", "photos", "required"],
          category: "Admissions",
          orderIndex: 1,
        },
        {
          question: "What combinations are offered?",
          answer:
            "The Nellikatte campus offers PCMB and PCMC in Science, and SEBA and CEBA in Commerce. The Bappalige campus offers PCMB and PCMC in Science, and SEBA in Commerce. Full subject lists are on each campus's Courses page.",
          keywords: ["combination", "course", "stream", "pcmb", "pcmc", "seba", "ceba", "science", "commerce", "subjects"],
          category: "Courses",
          orderIndex: 2,
        },
        {
          question: "What is the annual fee?",
          answer:
            "Fees differ by combination and campus, and range from ₹16,000 to ₹26,000 a year. The exact figure for each combination is listed on the Courses page. Please confirm the current year's fee with the office before paying.",
          keywords: [
            "fee", "fees", "cost", "payment", "charges", "amount", "tuition",
            "price", "pcmb", "pcmc", "seba", "ceba", "annual",
          ],
          category: "Fees",
          orderIndex: 3,
        },
        {
          question: "Is the last date for applications announced?",
          answer:
            "Application dates are published on the Notices page and scroll in the updates strip at the top of every page. Applications generally close once the sanctioned intake for a combination is filled.",
          keywords: ["last date", "deadline", "closing", "when", "dates", "schedule"],
          category: "Admissions",
          orderIndex: 4,
        },
        {
          question: "Is college transport available?",
          answer:
            "Yes. College buses run on the major routes in and around the taluk, with fixed morning and evening timings. Route details and charges are available at the office of each campus.",
          keywords: ["transport", "bus", "travel", "route", "vehicle", "conveyance"],
          category: "Facilities",
          orderIndex: 5,
        },
        {
          question: "Are scholarships available?",
          answer:
            "Students eligible for SC/ST, OBC and minority scholarships are helped with their applications by the office. Watch the Notices page for the application window each year.",
          keywords: ["scholarship", "sc", "st", "obc", "minority", "financial", "concession", "free"],
          category: "Fees",
          orderIndex: 6,
        },
        {
          question: "What were the last board results?",
          answer:
            `In the ${ACADEMIC_YEAR} Second PUC examinations the institution recorded a 98.2% pass rate, with 41 students scoring above 90%. Campus-wise results and topper lists are on the Results page.`,
          keywords: ["result", "results", "pass", "percentage", "topper", "marks", "board", "puc"],
          category: "Results",
          orderIndex: 7,
        },
        {
          question: "What are the office timings?",
          answer:
            "The office is open from 9:00 am to 4:30 pm on all working days, and from 9:00 am to 12:30 pm on Saturdays. It remains closed on Sundays and government holidays.",
          keywords: ["timing", "timings", "hours", "open", "office", "working", "when", "saturday"],
          category: "Contact",
          orderIndex: 8,
        },
        {
          question: "How do I contact the college?",
          answer:
            "Phone numbers and email addresses for both campuses are on the Contact page, along with the postal address and a map. You can also send an enquiry through the contact form and the office will reply.",
          keywords: ["contact", "phone", "call", "email", "address", "reach", "location", "where"],
          category: "Contact",
          orderIndex: 9,
        },
        {
          question: "Is hostel accommodation provided?",
          answer:
            "The college does not run a hostel of its own. The office can share a list of recognised private hostels and paying guest accommodation near each campus on request.",
          keywords: ["hostel", "accommodation", "stay", "residence", "boarding", "pg", "room"],
          category: "Facilities",
          orderIndex: 10,
        },
        {
          question: "Can I apply to both campuses?",
          answer:
            "Yes. The two campuses admit students separately, so you may submit an application to each. Please mention it to the office at the time of verification so your preference is recorded correctly.",
          keywords: ["both", "two", "campus", "branch", "either", "transfer", "change"],
          category: "Admissions",
          orderIndex: 11,
        },
      ],
    });
  }

  // ----------------------------------------------------------------- gallery
  if ((await prisma.galleryAlbum.count()) === 0) {
    const albumSeed = [
      {
        branchId: null,
        title: "Annual Day celebrations",
        slug: "annual-day-celebrations",
        description:
          "Cultural programmes and the prize distribution ceremony, with students from both campuses taking part.",
        eventDate: daysAgo(18),
        images: ["/images/campus-1.svg", "/images/campus-3.svg", "/images/campus-2.svg"],
      },
      {
        branchId: null,
        title: "Independence Day",
        slug: "independence-day",
        description: "Flag hoisting, march past and the cultural programme that followed.",
        eventDate: daysAgo(60),
        images: ["/images/campus-4.svg", "/images/campus-1.svg"],
      },
      {
        branchId: nellikatte.id,
        title: "Science exhibition",
        slug: "science-exhibition-nellikatte",
        description: "Investigatory projects presented by students of the Science stream.",
        eventDate: daysAgo(14),
        images: ["/images/campus-3.svg", "/images/campus-2.svg", "/images/campus-1.svg"],
      },
      {
        branchId: bappalige.id,
        title: "Sports day",
        slug: "sports-day-bappalige",
        description: "Track events, throwball and kho-kho finals on the campus ground.",
        eventDate: daysAgo(35),
        images: ["/images/campus-4.svg", "/images/campus-2.svg"],
      },
    ];

    for (const [index, album] of albumSeed.entries()) {
      await prisma.galleryAlbum.create({
        data: {
          branchId: album.branchId,
          title: album.title,
          slug: album.slug,
          description: album.description,
          eventDate: album.eventDate,
          coverImageUrl: album.images[0],
          orderIndex: index,
          images: {
            create: album.images.map((url, imageIndex) => ({
              url,
              caption: `${album.title} — photograph ${imageIndex + 1}`,
              orderIndex: imageIndex,
            })),
          },
        },
      });
    }
  }

  // -------------------------------------------------------------------- users
  const ownerHash = await bcrypt.hash(OWNER_PASSWORD, 12);
  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: {},
    create: {
      name: "Site Owner",
      email: OWNER_EMAIL,
      passwordHash: ownerHash,
      role: Role.OWNER,
      allBranches: true,
      mustChangePassword: true,
    },
  });

  const staffHash = await bcrypt.hash(STAFF_PASSWORD, 12);
  const staff = await prisma.user.upsert({
    where: { email: STAFF_EMAIL },
    update: {},
    create: {
      name: "College Office",
      email: STAFF_EMAIL,
      passwordHash: staffHash,
      role: Role.COLLEGE_ADMIN,
      allBranches: false,
      mustChangePassword: true,
      createdById: owner.id,
    },
  });

  // A deliberately modest starting grant: the office can read and work the
  // admissions queue and post notices, nothing more. The owner widens this
  // from the Staff Accounts screen whenever the college asks.
  const starterGrants: Capability[] = [
    Capability.APPLICATION_VIEW,
    Capability.APPLICATION_MANAGE,
    Capability.NEWS_VIEW,
    Capability.NEWS_MANAGE,
    Capability.CONTACT_VIEW,
  ];

  for (const capability of starterGrants) {
    await prisma.userCapability.upsert({
      where: { userId_capability: { userId: staff.id, capability } },
      update: {},
      create: { userId: staff.id, capability, grantedById: owner.id },
    });
  }

  for (const branch of branches) {
    await prisma.branchAccess.upsert({
      where: { userId_branchId: { userId: staff.id, branchId: branch.id } },
      update: {},
      create: { userId: staff.id, branchId: branch.id },
    });
  }

  // ------------------------------------------------------- sample admissions
  if ((await prisma.application.count()) === 0) {
    const courses = await prisma.course.findMany();
    const samples = [
      ["Aishwarya Hegde", "PCMB", nellikatte.id, Gender.FEMALE, 92.8],
      ["Karthik Shetty", "PCMC", nellikatte.id, Gender.MALE, 88.16],
      ["Fathima Nasreen", "SEBA", nellikatte.id, Gender.FEMALE, 79.5],
      ["Vignesh Rai", "PCMB", bappalige.id, Gender.MALE, 85.33],
      ["Sahana Bhat", "SEBA", bappalige.id, Gender.FEMALE, 81.0],
    ] as const;

    let counter = 1;
    for (const [name, code, branchId, gender, percentage] of samples) {
      const course = courses.find((item) => item.branchId === branchId && item.code === code);
      const branchCode = branchId === nellikatte.id ? "NLK" : "BPL";

      await prisma.application.create({
        data: {
          applicationNo: `AMB-${branchCode}-${new Date().getFullYear()}-${String(counter).padStart(5, "0")}`,
          branchId,
          courseId: course?.id,
          studentName: name,
          dateOfBirth: new Date(2009, counter % 12, (counter % 27) + 1),
          gender,
          email: `${name.split(" ")[0].toLowerCase()}.sample@example.com`,
          phone: `98${String(45000000 + counter * 137).slice(0, 8)}`,
          fatherName: "—",
          city: "Puttur",
          district: "Dakshina Kannada",
          state: "Karnataka",
          pincode: "574201",
          category: counter % 3 === 0 ? "OBC" : "General",
          sslcBoard: "Karnataka State Board (SSLC)",
          sslcYear: new Date().getFullYear(),
          sslcPercentage: percentage,
          preferredCombination: code,
          createdAt: daysAgo(counter * 2),
        },
      });
      counter += 1;
    }
  }

  console.log("\nSeed complete.");
  console.log("  Owner login :", OWNER_EMAIL, "/", OWNER_PASSWORD);
  console.log("  Staff login :", STAFF_EMAIL, "/", STAFF_PASSWORD);
  console.log("  Both accounts are flagged to change their password on first sign-in.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
