// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QUIZ_THANK_YOU_PATH } from "@/lib/quiz/constants";
import { quizQuestions } from "@/lib/quiz/questions";
import { resultContent } from "@/lib/quiz/result";
import { QUIZ_PROGRESS_KEY, QuizFlow } from "./quiz-flow";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const picks: Record<string, string> = {
  situation: "Missing many teeth, or my teeth are failing",
  arch: "Both",
  frustrations: "Trouble eating the foods I like",
  duration: "1 to 5 years",
  health: "None of these",
  comfort: "Very anxious",
  payment: "Canadian Dental Care Plan (CDCP)",
  timeline: "As soon as possible",
  location: "Orléans",
};

function answerCurrent() {
  const heading = screen.getByRole("heading", { level: 2 });
  const question = quizQuestions.find((entry) => entry.prompt === heading.textContent)!;
  const label = picks[question.id] ?? question.options[0].label;
  const option = question.options.find((entry) => entry.label === label) ?? question.options[0];
  fireEvent.click(screen.getByRole(question.type === "single" ? "radio" : "checkbox", { name: option.label }));
  fireEvent.click(screen.getByRole("button", { name: /next|see my result/i }));
}

function answerAll() {
  for (let index = 0; index < quizQuestions.length; index += 1) answerCurrent();
}

beforeEach(() => {
  localStorage.clear();
  push.mockReset();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("QuizFlow", () => {
  it("starts on question one and waits for an answer before moving on", () => {
    render(<QuizFlow />);
    expect(screen.getByText(`Question 1 of ${quizQuestions.length}`)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(quizQuestions[0].prompt);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("goes back to the previous question with its answer kept", () => {
    render(<QuizFlow />);
    answerCurrent();
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByRole("radio", { name: picks.situation })).toBeChecked();
  });

  it("resumes where the visitor left off without storing personal details", () => {
    const { unmount } = render(<QuizFlow />);
    answerCurrent();
    answerCurrent();
    unmount();

    render(<QuizFlow />);
    expect(screen.getByText(`Question 3 of ${quizQuestions.length}`)).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem(QUIZ_PROGRESS_KEY)!);
    expect(Object.keys(saved).sort()).toEqual(["answers", "startedAt", "step", "version"]);
  });

  it("previews the personalized result, then submits the lead and redirects", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ id: "1", resultPath: "full-arch", modifiers: ["sedation", "coverage"], leadTier: "hot" }),
        { status: 201 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<QuizFlow />);
    answerAll();
    expect(screen.getByText(resultContent["full-arch"].title)).toBeInTheDocument();

    vi.advanceTimersByTime(5000);
    fireEvent.change(screen.getByRole("textbox", { name: "First name" }), { target: { value: "Ann" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), { target: { value: "ann@example.com" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Phone" }), { target: { value: "613-555-0199" } });
    fireEvent.click(screen.getByRole("button", { name: /send me my results/i }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(`${QUIZ_THANK_YOU_PATH}?path=full-arch&m=sedation%2Ccoverage`),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/quiz-leads");
    expect(body).toMatchObject({
      firstName: "Ann",
      email: "ann@example.com",
      phone: "613-555-0199",
      preferredContact: "call",
      marketingConsent: false,
      website: "",
      answers: { situation: ["many"], timeline: ["asap"] },
    });
    expect(typeof body.startedAt).toBe("number");
    expect(localStorage.getItem(QUIZ_PROGRESS_KEY)).toBeNull();
  });

  it("shows the server's message when the lead is rejected", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Please check the highlighted fields." }), { status: 400 })),
    );
    render(<QuizFlow />);
    answerAll();
    fireEvent.change(screen.getByRole("textbox", { name: "First name" }), { target: { value: "Ann" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), { target: { value: "ann@example.com" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Phone" }), { target: { value: "613-555-0199" } });
    fireEvent.click(screen.getByRole("button", { name: /send me my results/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Please check the highlighted fields.");
    expect(push).not.toHaveBeenCalled();
  });
});
