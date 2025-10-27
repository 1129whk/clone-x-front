const state: any = {
  hydrated: true,
  posts: [],
  addPosts: jest.fn((items: any[]) => {
    state.posts = [...state.posts, ...items];
  }),
  addPost: jest.fn((item: any) => {
    state.posts = [item, ...state.posts];
  }),
  toggleLike: jest.fn(),
  toggleRetweet: jest.fn(),
  toggleBookmark: jest.fn(),
};

export const usePosts = () => state;
export default usePosts;
