// Typescript model for Workflow and WorkflowStep
export type WorkflowStep = {
  id: string;
  actor: "Employer" | "Worker" | string;
  description: string;
  completed?: boolean;
  completedDate?: string; // ISO date string
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdDate: string; // ISO date string
  startedDate?: string; // ISO date string
  completedDate?: string; // ISO date string
  dueDate?: string; // ISO date string
};

// Example JSON representation for a Maternity Leave workflow
export const sampleWorkflows: Workflow[] = [
  {
    id: "maternity-leave",
    name: "Maternity Leave",
    description:
      "Process for arranging maternity leave in compliance with UK law.",
    createdDate: "2025-06-05T09:00:00Z",
    dueDate: "2025-12-01T00:00:00Z",
    steps: [
      {
        id: "notify-employer",
        actor: "Worker",
        description:
          "Notify employer of pregnancy and expected week of childbirth in writing, at least 15 weeks before the baby is due.",
      },
      {
        id: "acknowledge-notification",
        actor: "Employer",
        description:
          "Acknowledge receipt of notification and confirm maternity leave start and end dates within 28 days.",
      },
      {
        id: "provide-matb1",
        actor: "Worker",
        description:
          "Provide MATB1 certificate (proof of pregnancy) to employer.",
      },
      {
        id: "assess-smp",
        actor: "Employer",
        description:
          "Assess eligibility for Statutory Maternity Pay (SMP) and provide written response.",
      },
      {
        id: "agree-leave-date",
        actor: "Worker",
        description:
          "Agree on maternity leave start date and discuss any flexible working requests.",
      },
      {
        id: "update-records",
        actor: "Employer",
        description: "Update HR records and arrange cover if necessary.",
      },
      {
        id: "begin-leave",
        actor: "Worker",
        description: "Begin maternity leave and keep in touch as agreed.",
      },
      {
        id: "support-return",
        actor: "Employer",
        description:
          "Support return-to-work planning and ensure compliance with UK employment law.",
      },
    ],
  },
];
