import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders an accessible button and handles interaction", () => {
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Save changes</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("does not handle interaction when disabled", () => {
    const handleClick = vi.fn();

    render(
      <Button disabled onClick={handleClick}>
        Save changes
      </Button>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
