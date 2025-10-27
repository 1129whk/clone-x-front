import { render, screen } from "@testing-library/react";
import RightBar from "@/components/bar/RightBar";

jest.mock("@/components/bar/PopularTags", () => () => <div>PopularTags</div>);
jest.mock("@/components/bar/Recommendations", () => () => (
  <div>Recommendations</div>
));
jest.mock("@/components/bar/Search", () => () => <div>Search</div>);

describe("RightBar 스크롤바 숨김", () => {
  it("내부 컨테이너가 스크롤바 숨김 클래스를 가진다", () => {
    render(<RightBar />);
    const rail = screen.getByTestId("rightbar-rail");
    expect(rail).toBeInTheDocument();
    expect(rail.className).toMatch(/rightbar-scroll/);
  });
});
