import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

const LESSON_STORAGE_KEY = "lessons_v3";
const TEST_STORAGE_KEY = "tests_v3";
const STUDENT_NAME_KEY = "student_name_v3";

const AdminProgress = () => {
  const [studentName, setStudentName] = useState("Mikey");
  const [lessons, setLessons] = useState<any[]>([]);
  const [tests, setTests] = useState<any>({});

  const [lessonInput, setLessonInput] = useState({
    hwTotal: 100,
    hwCorrect: 50,
    classTotal: 30,
    classCorrect: 15,
    understanding: 8,
    participation: 8,
  });

  const [testType, setTestType] = useState("pre");
  const [testInput, setTestInput] = useState({
    vocab: 25,
    grammar: 25,
    reading: 25,
    listening: 25,
    writing: 25,
  });

  useEffect(() => {
    setLessons(JSON.parse(localStorage.getItem(LESSON_STORAGE_KEY) || "[]"));
    setTests(JSON.parse(localStorage.getItem(TEST_STORAGE_KEY) || "{}"));

    const savedName = localStorage.getItem(STUDENT_NAME_KEY);
    if (savedName) setStudentName(savedName);
  }, []);

  useEffect(() => {
    localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(tests));
  }, [tests]);

  useEffect(() => {
    localStorage.setItem(STUDENT_NAME_KEY, studentName);
  }, [studentName]);

  const safePercent = (correct: number, total: number) => {
    if (!total || total <= 0) return 0;
    return (correct / total) * 100;
  };

  const lessonScores = (lesson: any) => {
    const homework = safePercent(lesson.hwCorrect, lesson.hwTotal);
    const classScore = safePercent(lesson.classCorrect, lesson.classTotal);
    const understanding = lesson.understanding * 10;
    const participation = lesson.participation * 10;
    const total = (homework + classScore + understanding + participation) / 4;
    const up = (understanding + participation) / 2;

    return { homework, classScore, understanding, participation, total, up };
  };

  const testTotal = (test: any) => {
    if (!test) return 0;
    return (
      test.vocab +
      test.grammar +
      test.reading +
      test.listening +
      test.writing
    );
  };

  const latestTestKey = tests.post
    ? "post"
    : tests.mid
      ? "mid"
      : tests.pre
        ? "pre"
        : null;

  const lastLessonScore = lessons.length
    ? lessonScores(lessons[lessons.length - 1]).total
    : 0;

  const firstLessonScore = lessons.length
    ? lessonScores(lessons[0]).total
    : 0;

  const lessonIncrease =
    lessons.length >= 2 ? lastLessonScore - firstLessonScore : 0;

  const preTotal = testTotal(tests.pre);
  const latestTotal = latestTestKey ? testTotal(tests[latestTestKey]) : 0;

  const testIncrease =
    tests.pre && latestTestKey && latestTestKey !== "pre"
      ? latestTotal - preTotal
      : 0;

  const testPercent =
    tests.pre && preTotal > 0 && latestTestKey && latestTestKey !== "pre"
      ? (testIncrease / preTotal) * 100
      : 0;

  const addLesson = () => {
    if (lessonInput.hwTotal <= 0 || lessonInput.classTotal <= 0) {
      alert("Homework Total and Classwork Total must be greater than 0.");
      return;
    }

    if (
      lessonInput.hwCorrect > lessonInput.hwTotal ||
      lessonInput.classCorrect > lessonInput.classTotal
    ) {
      alert("Correct answers cannot be greater than total questions.");
      return;
    }

    if (
      lessonInput.understanding < 0 ||
      lessonInput.understanding > 10 ||
      lessonInput.participation < 0 ||
      lessonInput.participation > 10
    ) {
      alert("Understanding and Participation must be between 0 and 10.");
      return;
    }

    setLessons([...lessons, lessonInput]);
  };

  const addTest = () => {
    setTests({
      ...tests,
      [testType]: testInput,
    });
  };

  const clearLessonInputs = () => {
    setLessonInput({
      hwTotal: 0,
      hwCorrect: 0,
      classTotal: 0,
      classCorrect: 0,
      understanding: 0,
      participation: 0,
    });
  };

  const clearTestInputs = () => {
    setTestInput({
      vocab: 0,
      grammar: 0,
      reading: 0,
      listening: 0,
      writing: 0,
    });
  };

  const resetLessons = () => {
    if (!confirm("Clear all lesson data?")) return;
    setLessons([]);
  };

  const resetTests = () => {
    if (!confirm("Clear all test data?")) return;
    setTests({});
  };

  const loadDemoData = () => {
    setStudentName("Mikey");

    setLessons([
      {
        hwTotal: 50,
        hwCorrect: 32,
        classTotal: 20,
        classCorrect: 12,
        understanding: 6.5,
        participation: 7,
      },
      {
        hwTotal: 50,
        hwCorrect: 35,
        classTotal: 20,
        classCorrect: 13,
        understanding: 7,
        participation: 7.5,
      },
      {
        hwTotal: 50,
        hwCorrect: 37,
        classTotal: 20,
        classCorrect: 14,
        understanding: 7.5,
        participation: 8,
      },
      {
        hwTotal: 50,
        hwCorrect: 40,
        classTotal: 20,
        classCorrect: 15,
        understanding: 8,
        participation: 8,
      },
      {
        hwTotal: 50,
        hwCorrect: 42,
        classTotal: 20,
        classCorrect: 16,
        understanding: 8.2,
        participation: 8.5,
      },
      {
        hwTotal: 50,
        hwCorrect: 44,
        classTotal: 20,
        classCorrect: 17,
        understanding: 8.6,
        participation: 8.5,
      },
    ]);

    setTests({
      pre: { vocab: 12, grammar: 14, reading: 15, listening: 13, writing: 11 },
      mid: { vocab: 16, grammar: 17, reading: 18, listening: 17, writing: 15 },
      post: { vocab: 20, grammar: 21, reading: 22, listening: 20, writing: 19 },
    });
  };

  const progressLabels = lessons.map((_, index) =>
    (index + 1) % 3 === 0 ? `Lesson ${index + 1}` : ""
  );

  const homeworkScores = lessons.map((lesson) =>
    Number(lessonScores(lesson).homework.toFixed(1))
  );

  const classworkScores = lessons.map((lesson) =>
    Number(lessonScores(lesson).classScore.toFixed(1))
  );

  const understandingScores = lessons.map((lesson) =>
    Number(lessonScores(lesson).understanding.toFixed(1))
  );

  const participationScores = lessons.map((lesson) =>
    Number(lessonScores(lesson).participation.toFixed(1))
  );

  const availableTests = ["pre", "mid", "post"].filter((key) => tests[key]);

  const sections = ["vocab", "grammar", "reading", "listening", "writing"];
  const sectionLabels = [
    "Vocabulary",
    "Grammar",
    "Reading",
    "Listening",
    "Writing",
  ];

  const postValues = tests.post
    ? [
      tests.post.vocab,
      tests.post.grammar,
      tests.post.reading,
      tests.post.listening,
      tests.post.writing,
    ]
    : [];

  const strongestSection =
    tests.post && postValues.length
      ? sectionLabels[postValues.indexOf(Math.max(...postValues))]
      : null;

  const weakestSection =
    tests.post && postValues.length
      ? sectionLabels[postValues.indexOf(Math.min(...postValues))]
      : null;

  const generateTeacherFeedback = () => {
    const name = studentName || "The student";

    if (lessons.length === 0 && availableTests.length === 0) {
      return `${name} does not have enough lesson or assessment data yet to generate a final evaluation.`;
    }

    const lessonTrend =
      lessonIncrease > 10
        ? "strong overall improvement"
        : lessonIncrease > 0
          ? "steady progress"
          : "stable progress with room for further improvement";

    const testTrend =
      tests.pre && latestTestKey && latestTestKey !== "pre"
        ? `Assessment results show a ${testPercent.toFixed(1)}% change from the Pre Test to the latest test.`
        : "More assessment data is needed for a complete test comparison.";

    const sectionText =
      strongestSection && weakestSection
        ? `${name}'s strongest area is ${strongestSection}, while ${weakestSection} requires more attention.`
        : "Further section-level data will help identify specific strengths and weaknesses.";

    return `${name} has shown ${lessonTrend} throughout the recorded learning period. Lesson data reflects development in homework accuracy, classwork accuracy, understanding, and participation. ${testTrend} ${sectionText} For the next stage of learning, ${name} should focus on improving consistency, accuracy, and independent problem-solving. Future lessons should prioritise weaker skill areas while maintaining strengths through regular review and progressive practice.`;
  };

  const homeworkClassworkLineData = {
    labels: progressLabels,
    datasets: [
      {
        label: "Homework",
        data: homeworkScores,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.18)",
        borderWidth: 4,
        tension: 0.35,
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: "Classwork",
        data: classworkScores,
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.18)",
        borderWidth: 4,
        tension: 0.35,
        pointBackgroundColor: "#EF4444",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const understandingParticipationLineData = {
    labels: progressLabels,
    datasets: [
      {
        label: "Understanding",
        data: understandingScores,
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.18)",
        borderWidth: 4,
        tension: 0.35,
        pointBackgroundColor: "#F59E0B",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: "Participation",
        data: participationScores,
        borderColor: "#14B8A6",
        backgroundColor: "rgba(20, 184, 166, 0.18)",
        borderWidth: 4,
        tension: 0.35,
        pointBackgroundColor: "#14B8A6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const barColors = ["#60A5FA", "#FCA5A5", "#FCD34D"];

  const barData = {
    labels: sectionLabels,
    datasets: availableTests.map((key, i) => ({
      label:
        key === "pre"
          ? "Pre Test"
          : key === "mid"
            ? "Mid Test"
            : "Post Test",
      data: sections.map((section) => tests[key][section]),
      backgroundColor: barColors[i],
      borderColor: barColors[i],
      borderWidth: 1,
      borderRadius: 6,
      borderSkipped: false,
    })),
  };

  const pieData = {
    labels: sectionLabels,
    datasets: [
      {
        data: postValues,
        backgroundColor: [
          "#3B82F6",
          "#EF4444",
          "#F59E0B",
          "#FACC15",
          "#14B8A6",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 100 },
    },
    plugins: {
      legend: { position: "bottom" as const },
      datalabels: { display: false },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: false },
      y: { beginAtZero: true },
    },
    plugins: {
      legend: { position: "bottom" as const },
      datalabels: {
        anchor: "end" as const,
        align: "top" as const,
        font: { weight: "bold" as const },
        formatter: (value: number) => value,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "55%",
    plugins: {
      legend: { position: "bottom" as const },
      datalabels: {
        color: "#10264d",
        font: { weight: "bold" as const },
        formatter: (value: number, context: any) => {
          const data = context.chart.data.datasets[0].data;
          const total = data.reduce(
            (sum: number, item: number) => sum + item,
            0
          );
          if (!total) return "0%";
          return `${((value / total) * 100).toFixed(1)}%`;
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] px-4 py-8 text-[#10264d] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold sm:text-3xl">Student Progress Dashboard</h1>
          <Button type="button" variant="outline" className="w-full rounded-2xl sm:w-auto" onClick={loadDemoData}>
            Load Demo Data
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[480px_1fr]">
          <div className="space-y-6">
            <Card className="rounded-[18px] border-[#dfe7f5] bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">1. Lesson Input</h2>

              <div className="mb-3">
                <label className="mb-1 block text-sm font-bold text-[#33466f]">
                  Student Name
                </label>
                <input
                  type="text"

                  autoComplete="off"
                  className="w-full rounded-2xl border border-[#cfd9ea] bg-white px-4 py-3 text-base outline-none transition focus:border-[#1459d9] focus:ring-4 focus:ring-[#1459d9]/10"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-bold text-[#33466f]">
                    Homework Total
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full rounded-2xl border border-[#cfd9ea] bg-white px-4 py-3 text-base outline-none transition focus:border-[#1459d9] focus:ring-4 focus:ring-[#1459d9]/10"
                    value={lessonInput.hwTotal}
                    onChange={(e) =>
                      setLessonInput({
                        ...lessonInput,
                        hwTotal: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-[#33466f]">
                    Homework Correct
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full rounded-2xl border border-[#cfd9ea] bg-white px-4 py-3 text-base outline-none transition focus:border-[#1459d9] focus:ring-4 focus:ring-[#1459d9]/10"
                    value={lessonInput.hwCorrect}
                    onChange={(e) =>
                      setLessonInput({
                        ...lessonInput,
                        hwCorrect: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-[#33466f]">
                    Classwork Total
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full rounded-2xl border border-[#cfd9ea] bg-white px-4 py-3 text-base outline-none transition focus:border-[#1459d9] focus:ring-4 focus:ring-[#1459d9]/10"
                    value={lessonInput.classTotal}
                    onChange={(e) =>
                      setLessonInput({
                        ...lessonInput,
                        classTotal: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-[#33466f]">
                    Classwork Correct
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full rounded-2xl border border-[#cfd9ea] bg-white px-4 py-3 text-base outline-none transition focus:border-[#1459d9] focus:ring-4 focus:ring-[#1459d9]/10"
                    value={lessonInput.classCorrect}
                    onChange={(e) =>
                      setLessonInput({
                        ...lessonInput,
                        classCorrect: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-[#33466f]">
                    Understanding /10
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full rounded-2xl border border-[#cfd9ea] bg-white px-4 py-3 text-base outline-none transition focus:border-[#1459d9] focus:ring-4 focus:ring-[#1459d9]/10"
                    value={lessonInput.understanding}
                    onChange={(e) =>
                      setLessonInput({
                        ...lessonInput,
                        understanding: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-[#33466f]">
                    Participation /10
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full rounded-2xl border border-[#cfd9ea] bg-white px-4 py-3 text-base outline-none transition focus:border-[#1459d9] focus:ring-4 focus:ring-[#1459d9]/10"
                    value={lessonInput.participation}
                    onChange={(e) =>
                      setLessonInput({
                        ...lessonInput,
                        participation: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
                <Button
                  type="button"
                  className="w-full rounded-2xl sm:w-auto"
                  onClick={addLesson}>
                  Add Lesson & Generate Graphs
                </Button>
                <Button
                  type="button"
                  className="w-full rounded-2xl sm:w-auto"
                  variant="outline" onClick={clearLessonInputs}>
                  Clear Inputs
                </Button>
                <Button
                  type="button"
                  className="w-full rounded-2xl sm:w-auto"
                  variant="destructive" onClick={resetLessons}>
                  Reset Lessons
                </Button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-center text-sm">
                  <tbody>
                    {lessons.length === 0 ? (
                      <tr>
                        <td className="p-2 text-[#7b8dac]">
                          No lessons added yet.
                        </td>
                      </tr>
                    ) : (
                      <>
                        <tr className="border-b">
                          <th className="p-2">Lesson</th>
                          <th className="p-2">HW%</th>
                          <th className="p-2">Class%</th>
                          <th className="p-2">U</th>
                          <th className="p-2">P</th>
                          <th className="p-2">Total</th>
                        </tr>

                        {lessons.map((lesson, index) => {
                          const score = lessonScores(lesson);

                          return (
                            <tr key={index} className="border-b">
                              <td className="p-2">{index + 1}</td>
                              <td className="p-2">
                                {score.homework.toFixed(1)}
                              </td>
                              <td className="p-2">
                                {score.classScore.toFixed(1)}
                              </td>
                              <td className="p-2">
                                {score.understanding.toFixed(1)}
                              </td>
                              <td className="p-2">
                                {score.participation.toFixed(1)}
                              </td>
                              <td className="p-2">
                                {score.total.toFixed(1)}
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="rounded-[18px] border-[#dfe7f5] bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">2. Test Input</h2>

              <div className="mb-3">
                <label className="mb-1 block text-sm font-bold text-[#33466f]">
                  Test Type
                </label>
                <select
                  value={testType}
                  className="w-full rounded-2xl border border-[#cfd9ea] bg-white px-4 py-3 text-base outline-none transition focus:border-[#1459d9] focus:ring-4 focus:ring-[#1459d9]/10"
                  onChange={(e) => setTestType(e.target.value)}
                >
                  <option value="pre">Pre Test</option>
                  <option value="mid">Mid Test</option>
                  <option value="post">Post Test</option>
                </select>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {Object.keys(testInput).map((key) => (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-bold capitalize text-[#33466f]">
                      {key}
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full rounded-2xl border border-[#cfd9ea] bg-white px-4 py-3 text-base outline-none transition focus:border-[#1459d9] focus:ring-4 focus:ring-[#1459d9]/10"
                      value={(testInput as any)[key]}
                      onChange={(e) =>
                        setTestInput({
                          ...testInput,
                          [key]: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
                <Button type="button" className="w-full rounded-2xl sm:w-auto" onClick={addTest}>
                  Add Test & Generate Graphs
                </Button>

                <Button type="button" className="w-full rounded-2xl sm:w-auto" variant="outline" onClick={clearTestInputs}>
                  Clear Inputs
                </Button>

                <Button type="button" className="w-full rounded-2xl sm:w-auto" variant="destructive" onClick={resetTests}>
                  Reset Tests
                </Button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-center text-sm">
                  <tbody>
                    {availableTests.length === 0 ? (
                      <tr>
                        <td className="p-2 text-[#7b8dac]">
                          No tests added yet.
                        </td>
                      </tr>
                    ) : (
                      <>
                        <tr className="border-b">
                          <th className="p-2">Test</th>
                          <th className="p-2">V</th>
                          <th className="p-2">G</th>
                          <th className="p-2">R</th>
                          <th className="p-2">L</th>
                          <th className="p-2">W</th>
                          <th className="p-2">Total</th>
                        </tr>

                        {availableTests.map((key) => {
                          const test = tests[key];

                          return (
                            <tr key={key} className="border-b">
                              <td className="p-2 capitalize">{key}</td>
                              <td className="p-2">{test.vocab}</td>
                              <td className="p-2">{test.grammar}</td>
                              <td className="p-2">{test.reading}</td>
                              <td className="p-2">{test.listening}</td>
                              <td className="p-2">{test.writing}</td>
                              <td className="p-2">{testTotal(test)}</td>
                            </tr>
                          );
                        })}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ["Current Total", Math.round(lastLessonScore)],
                [
                  "Lesson Increase",
                  `${lessonIncrease >= 0 ? "+" : ""}${lessonIncrease.toFixed(
                    1
                  )}`,
                ],
                [
                  "Test Increase",
                  `${testIncrease >= 0 ? "+" : ""}${testIncrease.toFixed(1)}`,
                ],
                ["Test Improvement", `${testPercent.toFixed(1)}%`],
              ].map(([label, value]) => (
                <Card
                  key={label}
                  className="rounded-[18px] border-[#dfe7f5] bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-bold text-[#607399]">{label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-[#1459d9] sm:text-4xl">
                    {value}
                  </p>
                </Card>
              ))}
            </div>

            <Card className="rounded-[18px] border-[#dfe7f5] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">
                Graph 1A: Homework & Classwork Accuracy
              </h2>
              <p className="mt-1 text-sm text-[#607399]">
                Tracks homework accuracy and classwork accuracy across lessons.
              </p>

              <div className="mt-4 h-[280px] sm:h-[340px]">
                {lessons.length > 0 ? (
                  <Line data={homeworkClassworkLineData} options={lineOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[14px] border border-dashed border-[#cfd9ea] bg-[#f8fbff] text-center text-[#7b8dac]">
                    Add at least 1 lesson to generate this graph.
                  </div>
                )}
              </div>
            </Card>

            <Card className="rounded-[18px] border-[#dfe7f5] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">
                Graph 1B: Understanding & Participation
              </h2>
              <p className="mt-1 text-sm text-[#607399]">
                Tracks teacher-rated understanding and participation across lessons.
              </p>

              <div className="mt-4 h-[280px] sm:h-[340px]">
                {lessons.length > 0 ? (
                  <Line data={understandingParticipationLineData} options={lineOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[14px] border border-dashed border-[#cfd9ea] bg-[#f8fbff] text-center text-[#7b8dac]">
                    Add at least 1 lesson to generate this graph.
                  </div>
                )}
              </div>
            </Card>

            <Card className="rounded-[18px] border-[#dfe7f5] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">
                Graph 2: Pre / Mid / Post Test Grouped Bar
              </h2>
              <p className="mt-1 text-sm text-[#607399]">
                Mid Test is optional. Each section shows grouped bars for
                comparison.
              </p>

              <div className="mt-4 h-[300px] sm:h-[360px]">
                {availableTests.length > 0 ? (
                  <Bar data={barData} options={barOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[14px] border border-dashed border-[#cfd9ea] bg-[#f8fbff] text-center text-[#7b8dac]">
                    Add Pre / Mid / Post test data to generate this graph.
                  </div>
                )}
              </div>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="rounded-[18px] border-[#dfe7f5] bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold">
                  Graph 3: Text Data Summary
                </h2>

                <div className="mt-4 rounded-[14px] border border-[#dfe7f5] p-5">
                  <p className="text-sm font-bold text-[#607399]">
                    Score Increase from Pre Test
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-[#1459d9] sm:text-4xl">
                    {testIncrease >= 0 ? "+" : ""}
                    {testIncrease.toFixed(1)} points
                  </p>
                </div>

                <div className="mt-4 rounded-[14px] border border-[#dfe7f5] p-5">
                  <p className="text-sm font-bold text-[#607399]">
                    Percentage Increase from Pre Test
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-[#1459d9] sm:text-4xl">
                    {testPercent.toFixed(1)}%
                  </p>
                </div>
              </Card>

              <Card className="rounded-[18px] border-[#dfe7f5] bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold">
                  Graph 4: Post Test Strength Pie
                </h2>

                <div className="mt-4 h-[280px] sm:h-[320px]">
                  {tests.post ? (
                    <Doughnut data={pieData} options={pieOptions} />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-[14px] border border-dashed border-[#cfd9ea] bg-[#f8fbff] text-center text-[#7b8dac]">
                      Add Post Test data to generate this pie graph.
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <Card className="rounded-[18px] border-[#dfe7f5] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">Auto Teacher Feedback</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#33466f]">
                {generateTeacherFeedback()}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProgress;