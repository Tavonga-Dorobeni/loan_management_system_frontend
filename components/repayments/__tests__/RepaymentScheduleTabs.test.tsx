import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RepaymentScheduleTabs } from "../RepaymentScheduleTabs";
import type { ScheduleMonth } from "@/lib/api/repayments";

function makeMonth(month: number, status: ScheduleMonth["status"]): ScheduleMonth {
  return {
    month,
    label: ["", "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"][month],
    expected: 100,
    received: status === "FULL" ? 100 : status === "PARTIAL" ? 50 : 0,
    outstanding: status === "FULL" ? 0 : status === "PARTIAL" ? 50 : 100,
    activeLoanCount: 1,
    repaymentCount: status === "UNPAID" ? 0 : 1,
    status,
  };
}

describe("RepaymentScheduleTabs", () => {
  it("renders 12 month tabs and pads inactive months from the API response", () => {
    // Only Jan, Feb, Mar provided — the rest should default to INACTIVE.
    const months: ScheduleMonth[] = [
      makeMonth(1, "FULL"),
      makeMonth(2, "PARTIAL"),
      makeMonth(3, "UNPAID"),
    ];
    render(
      <RepaymentScheduleTabs
        months={months}
        activeMonth={3}
        onActiveChange={() => {}}
        renderContent={(m) => <div data-testid="content">{m.label}</div>}
      />,
    );

    const triggers = screen.getAllByRole("tab");
    expect(triggers).toHaveLength(12);
    expect(triggers[0]).toHaveTextContent("Jan");
    expect(triggers[11]).toHaveTextContent("Dec");
  });

  it("disables the trigger for INACTIVE months", () => {
    const months: ScheduleMonth[] = [
      makeMonth(1, "FULL"),
      makeMonth(2, "PARTIAL"),
    ];
    render(
      <RepaymentScheduleTabs
        months={months}
        activeMonth={1}
        onActiveChange={() => {}}
        renderContent={() => null}
      />,
    );

    const triggers = screen.getAllByRole("tab");
    expect(triggers[0]).not.toBeDisabled(); // Jan: FULL
    expect(triggers[1]).not.toBeDisabled(); // Feb: PARTIAL
    expect(triggers[2]).toBeDisabled(); // Mar onwards: INACTIVE
    expect(triggers[11]).toBeDisabled(); // Dec
  });

  it("invokes onActiveChange with the clicked month number", async () => {
    const onActiveChange = jest.fn();
    const months: ScheduleMonth[] = Array.from({ length: 12 }, (_, i) =>
      makeMonth(i + 1, "UNPAID"),
    );
    render(
      <RepaymentScheduleTabs
        months={months}
        activeMonth={1}
        onActiveChange={onActiveChange}
        renderContent={() => null}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: /jul/i }));
    expect(onActiveChange).toHaveBeenCalledWith(7);
  });
});
