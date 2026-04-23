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
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-3xl px-6">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <PageTitle title={pageTitle} />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            {pageTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <main className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <Markdown>{content}</Markdown>
        </main>

        
      </div>
    </div>
  );
};

export default PageWrapper;