export type PolicyBullet = {
  text: string;
  children?: string[];
};

export type PolicySection = {
  number: number;
  title: string;
  paragraphs?: string[];
  bullets?: PolicyBullet[];
  afterBullets?: string[];
};

export type TutorPolicyContent = {
  title: string;
  subtitle?: string;
  policyTitle: string;
  lastUpdated: string;
  intro: string;
  sections: PolicySection[];
};

export const tutorPolicyContent: Record<"en" | "zh", TutorPolicyContent> = {
  en: {
    title: "Luna Education — Tutor Cancellation & Professional Conduct Policy",
    policyTitle: "Tutor Cancellation Policy",
    lastUpdated: "June 22, 2026",
    intro:
      "At Luna Education, we value professionalism, responsibility, and consistency in teaching. Tutors are expected to maintain reliable attendance and communicate proactively regarding scheduling matters.",
    sections: [
      {
        number: 1,
        title: "Advance Notice for Cancellation",
        bullets: [
          {
            text: "Tutors should provide at least 24 hours notice if they are unable to conduct a lesson.",
          },
          {
            text: "Tutors are responsible for informing both:",
            children: [
              "the Luna Education management team, and",
              "the student/parent",
            ],
          },
        ],
      },
      {
        number: 2,
        title: "Emergency Situations",
        paragraphs: [
          "We understand emergencies may happen. Exceptions may be considered for:",
        ],
        bullets: [
          { text: "medical emergencies," },
          { text: "family emergencies," },
          { text: "severe technical issues," },
          { text: "transportation disruptions," },
          { text: "or other serious unforeseen circumstances." },
        ],
        afterBullets: [
          "Tutors should notify the team as soon as possible in such cases.",
        ],
      },
      {
        number: 3,
        title: "Repeated Last-Minute Cancellations",
        bullets: [
          {
            text: "Repeated last-minute cancellations may affect:",
            children: [
              "future student assignments,",
              "scheduling priority,",
              "performance evaluation,",
              "continued collaboration with Luna Education.",
            ],
          },
        ],
      },
      {
        number: 4,
        title: "No-Show Policy",
        bullets: [
          {
            text: "Tutors who fail to attend a lesson without prior notice will be considered a no-show.",
          },
          {
            text: "Serious or repeated no-shows (more than twice a month) may result in:",
            children: [
              "formal warning,",
              "temporary suspension of lesson assignments,",
              "termination of teaching collaboration.",
            ],
          },
        ],
      },
      {
        number: 5,
        title: "Lesson Preparation & Professionalism",
        paragraphs: ["Tutors are expected to:"],
        bullets: [
          { text: "arrive punctually," },
          { text: "prepare lesson materials beforehand," },
          { text: "maintain professional communication," },
          { text: "provide lesson feedback on time (within 24 hours of lesson)," },
          { text: "conduct lessons responsibly and respectfully." },
        ],
      },
      {
        number: 6,
        title: "Technical Issues During Online Lessons",
        bullets: [
          {
            text: "Tutors should ensure a stable internet connection and functional teaching environment before lessons.",
          },
          {
            text: "In cases of severe technical problems:",
            children: [
              "makeup time may be required,",
              "or the lesson may need to be rescheduled.",
            ],
          },
        ],
      },
      {
        number: 7,
        title: "Communication Responsibility",
        bullets: [
          {
            text: "Tutors should respond to important work-related messages within a reasonable timeframe.",
          },
          {
            text: "Long periods of unresponsiveness without notice may affect teaching arrangements.",
          },
        ],
      },
      {
        number: 8,
        title: "Lesson Recording Policy",
        bullets: [
          { text: "All lessons conducted under Luna Education must be recorded." },
          {
            text: "Recordings may be reviewed by Luna Education management on a random basis for purposes including:",
            children: [
              "maintaining teaching quality,",
              "monitoring student progress,",
              "monitoring tutor performance and development,",
              "resolving potential disputes or misunderstandings.",
            ],
          },
          {
            text: "Where appropriate and beneficial to the student’s learning, selected lesson recordings may be shared with parents or guardians.",
          },
          {
            text: "Luna Education will not use, publish, distribute, or share lesson recordings externally without the consent of both the tutor and the student (or parent/guardian where applicable), except where required by law.",
          },
          {
            text: "All recordings will be handled confidentially and used solely for educational and quality assurance purposes.",
          },
        ],
      },
      {
        number: 9,
        title: "Feedback & Progress Reporting Requirements",
        paragraphs: [
          "Tutors are required to provide timely feedback and progress updates throughout the student’s learning journey.",
          "The following feedback is mandatory:",
        ],
        bullets: [
          {
            text: "After Every Lesson",
            children: [
              "Brief lesson summary,",
              "Topics covered,",
              "Student participation and performance,",
              "Homework or follow-up tasks (if applicable).",
            ],
          },
          {
            text: "After Every Third Lesson",
            children: [
              "Short progress review,",
              "Areas of improvement,",
              "Learning goals for upcoming lessons,",
              "Recommendations for continued development.",
            ],
          },
          {
            text: "At the End of Each Lesson Package",
            children: [
              "Comprehensive progress report,",
              "Strengths demonstrated,",
              "Areas requiring further support,",
              "Overall assessment of student growth,",
              "Recommendations for future learning plans.",
            ],
          },
        ],
      },
    ],
  },
  zh: {
    title: "Luna Education — 导师取消课程与工作规范政策",
    subtitle: "中文版",
    policyTitle: "导师取消课程政策",
    lastUpdated: "2026年6月22日",
    intro:
      "在 Luna Education，我们重视老师的专业度、责任感与教学稳定性。所有导师都应尽可能保持稳定出勤，并主动沟通课程安排相关事项。",
    sections: [
      {
        number: 1,
        title: "提前通知取消课程",
        bullets: [
          { text: "若导师无法上课，应尽量提前至少 24 小时通知。" },
          {
            text: "导师需及时通知：",
            children: [
              "Luna Education 管理团队，",
              "以及学生／家长",
            ],
          },
        ],
      },
      {
        number: 2,
        title: "紧急情况处理",
        paragraphs: ["我们理解突发情况可能发生，包括："],
        bullets: [
          { text: "医疗紧急情况，" },
          { text: "家庭紧急情况，" },
          { text: "严重网络或设备问题，" },
          { text: "交通问题，" },
          { text: "或其他不可预见的重要情况。" },
        ],
        afterBullets: [
          "如遇以上情况，请导师尽快联系管理团队。",
        ],
      },
      {
        number: 3,
        title: "多次临时取消课程",
        bullets: [
          {
            text: "若导师多次临时取消课程，可能会影响：",
            children: [
              "后续学生分配，",
              "排课优先权，",
              "工作表现评估，",
              "与 Luna Education 的长期合作。",
            ],
          },
        ],
      },
      {
        number: 4,
        title: "无故缺席（No-Show）",
        bullets: [
          { text: "若导师未提前通知且未出席课程，将视为无故缺席。" },
          {
            text: "严重或多次无故缺席（每月超过两次）可能导致：",
            children: [
              "正式警告，",
              "暂停安排课程，",
              "终止合作关系。",
            ],
          },
        ],
      },
      {
        number: 5,
        title: "教学准备与专业要求",
        paragraphs: ["导师需做到："],
        bullets: [
          { text: "准时上课，" },
          { text: "提前准备教材与内容，" },
          { text: "保持专业沟通态度，" },
          { text: "按时提交课程反馈（24 小时以内），" },
          { text: "认真负责地完成教学工作。" },
        ],
      },
      {
        number: 6,
        title: "网络与技术问题",
        bullets: [
          { text: "导师需确保上课前网络及设备稳定。" },
          {
            text: "若课程中出现严重技术问题：",
            children: [
              "可能需要补回时间，",
              "或重新安排课程。",
            ],
          },
        ],
      },
      {
        number: 7,
        title: "沟通责任",
        bullets: [
          { text: "导师应在合理时间内回复重要工作消息。" },
          { text: "长时间无回应且未提前说明，可能会影响后续教学安排。" },
        ],
      },
      {
        number: 8,
        title: "课程录制政策",
        bullets: [
          { text: "Luna Education 所有课程均需进行录制。" },
          {
            text: "课程录像将可能由管理团队进行抽查，用于：",
            children: [
              "教学质量监督，",
              "学生学习进度追踪，",
              "导师教学表现评估与培训，",
              "处理可能出现的争议或沟通问题。",
            ],
          },
          { text: "如有助于学生学习，相关课程录像可在必要时提供给家长查阅。" },
          {
            text: "未经导师及学生（或家长）同意，Luna Education 不会将课程录像用于任何外部用途、公开发布或向第三方分享（法律要求除外）。",
          },
          { text: "所有录像资料将严格保密，仅用于教学与质量管理用途。" },
        ],
      },
      {
        number: 9,
        title: "课程反馈与学习报告要求",
        paragraphs: [
          "导师需定期提交学生学习反馈与进度报告。",
          "以下反馈为必须完成项目：",
        ],
        bullets: [
          {
            text: "每节课后",
            children: [
              "课程内容总结，",
              "学习内容记录，",
              "学生课堂表现，",
              "作业或课后任务（如适用）。",
            ],
          },
          {
            text: "每三节课后",
            children: [
              "阶段性学习进度总结，",
              "需要加强的部分，",
              "下一阶段学习目标，",
              "教学建议。",
            ],
          },
          {
            text: "课程套餐结束后",
            children: [
              "完整学习报告，",
              "学生优势分析，",
              "需要继续提升的方面，",
              "整体学习成果评估，",
              "后续学习建议与规划。",
            ],
          },
        ],
      },
    ],
  },
};
