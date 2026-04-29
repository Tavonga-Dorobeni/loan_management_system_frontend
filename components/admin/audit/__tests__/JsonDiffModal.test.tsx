import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JsonDiffModal } from "../JsonDiffModal";

describe("JsonDiffModal", () => {
  it("renders before/after panes when metadata has both", async () => {
    const user = userEvent.setup();
    render(
      <JsonDiffModal
        metadata={{
          before: { status: "PENDING" },
          after: { status: "SUCCESS" },
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /diff/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/^Before$/)).toBeInTheDocument();
    expect(within(dialog).getByText(/^After$/)).toBeInTheDocument();
    expect(within(dialog).getByText(/PENDING/)).toBeInTheDocument();
    expect(within(dialog).getByText(/SUCCESS/)).toBeInTheDocument();
  });

  it("falls back to a single Metadata pane when there's no before/after", async () => {
    const user = userEvent.setup();
    render(
      <JsonDiffModal metadata={{ totalRows: 47, successCount: 45 }} />,
    );

    await user.click(screen.getByRole("button", { name: /diff/i }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/^Metadata$/)).toBeInTheDocument();
    expect(within(dialog).getByText(/totalRows/)).toBeInTheDocument();
    expect(within(dialog).queryByText(/^Before$/)).not.toBeInTheDocument();
  });
});
