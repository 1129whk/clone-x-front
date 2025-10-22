import { render, screen } from "@testing-library/react";
import HighlightText from "@/components/common/HighlightText";

describe("HighlightText", () => {
  it("해시태그/멘션을 파란색으로 렌더링한다", () => {
    render(<HighlightText text="안녕 #React @kimdev" linkify={false} />);
    const hash = screen.getByText("#React");
    const mention = screen.getByText("@kimdev");
    expect(hash).toHaveClass("text-iconBlue");
    expect(mention).toHaveClass("text-iconBlue");
  });
});
