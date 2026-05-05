import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YearSelector } from "../YearSelector";

describe("YearSelector", () => {
  it("renders the supplied years and reflects the value", () => {
    render(<YearSelector value={2026} years={[2025, 2026, 2027]} onChange={() => {}} />);
    const select = screen.getByLabelText(/year/i) as HTMLSelectElement;
    expect(select.value).toBe("2026");
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(["2025", "2026", "2027"]);
  });

  it("calls onChange with a number when the user selects a different year", async () => {
    const onChange = jest.fn();
    render(<YearSelector value={2026} years={[2025, 2026, 2027]} onChange={onChange} />);
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText(/year/i), "2027");
    expect(onChange).toHaveBeenCalledWith(2027);
  });

  it("falls back to showing the current value when years list is empty", () => {
    render(<YearSelector value={2030} years={[]} onChange={() => {}} />);
    const select = screen.getByLabelText(/year/i) as HTMLSelectElement;
    expect(select.value).toBe("2030");
    expect(Array.from(select.options).map((o) => o.value)).toEqual(["2030"]);
  });
});
