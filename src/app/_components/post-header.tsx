import Avatar from "./avatar";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";
import { PostTitle } from "@/app/_components/post-title";
import { type Author } from "@/interfaces/author";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  author: Author;
};

export function PostHeader({ title, coverImage, date, author }: Props) {
  return (
    <div className=" border-b-2 mb-16">
      <PostTitle>{title}</PostTitle>
      <div className="hidden md:flex md:mb-12 md:items-center md:justify-between">
        <Avatar name={author.name} picture={author.picture} />
        <DateFormatter dateString={date} />
      </div>
      {/* <div className="mb-8 md:mb-16 sm:mx-0">
        <CoverImage title={title} src={coverImage} />
      </div> */}
      <div className="max-w-2xl mx-auto">
        <div className="flex md:hidden mb-6 items-center justify-between">
          <Avatar name={author.name} picture={author.picture} />
          <DateFormatter dateString={date} />
        </div>
        <div className="text-lg">
          {/* <DateFormatter dateString={date} /> */}
        </div>
      </div>
    </div>
  );
}
