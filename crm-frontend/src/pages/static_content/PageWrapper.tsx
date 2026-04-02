import { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import Markdown from "./Markdown";

type PageWrapperProps = {
  md: string;
  pageTitle: string;
};

const PageWrapper = ({ md, pageTitle }: PageWrapperProps) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(md)
      .then((res) => res.text())
      .then(setContent);
  }, [md]);

  return (
    <div className="mt-10 flex w-full flex-col items-center py-10">
      <PageTitle title={pageTitle} />

      <h1 className="mb-10 border-b-4 pb-2 text-3xl font-bold tracking-tight md:text-4xl">
        {pageTitle}
      </h1>

      <main className="w-full max-w-[1000px] px-4">
        <Markdown>{content}</Markdown>
      </main>
    </div>
  );
};

export default PageWrapper;