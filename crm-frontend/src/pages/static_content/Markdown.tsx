import React from "react";
import ReactMarkdown from "react-markdown";

type MarkdownProps = React.ComponentProps<typeof ReactMarkdown>;

function MarkdownParagraph(props: any) {
  return (
    <p className="leading-7 text-slate-600 [&:not(:first-child)]:mt-4">
      {props.children}
    </p>
  );
}

const MarkdownHeading = (props: any) => {
  const { level, children } = props;

  switch (level) {
    case 1:
      return (
        <h1 className="mt-8 text-3xl font-semibold tracking-tight text-slate-900">
          {children}
        </h1>
      );
    case 2:
      return (
        <h2 className="mt-10 border-b border-slate-200 pb-2 text-xl font-semibold text-slate-900">
          {children}
        </h2>
      );
    case 3:
      return (
        <h3 className="mt-6 text-lg font-medium text-slate-800">
          {children}
        </h3>
      );
    case 4:
      return (
        <h4 className="mt-4 text-base font-medium text-slate-700">
          {children}
        </h4>
      );
    default:
      return (
        <h5 className="mt-4 text-sm font-medium text-slate-600">
          {children}
        </h5>
      );
  }
};

const MarkdownLink = (props: any) => {
  return (
    <a
      href={props.href}
      className="font-medium text-primary hover:underline"
      target="_blank"
      rel="noreferrer"
    >
      {props.children}
    </a>
  );
};

const MarkdownListItem = (props: any) => {
  return (
    <li className="ml-5 list-disc text-slate-600 marker:text-slate-400">
      {props.children}
    </li>
  );
};

function MarkdownPre(props: any) {
  return (
    <pre className="my-6 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-sm text-slate-100">
      {props.children}
    </pre>
  );
}

function MarkdownCode(props: any) {
  const { inline, children } = props;

  if (inline) {
    return (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.95em] text-slate-800">
        {children}
      </code>
    );
  }

  return <code className="font-mono text-sm">{children}</code>;
}

function MarkdownBlockquote(props: any) {
  return (
    <blockquote className="my-6 rounded-r-2xl border-l-4 border-sky-200 bg-sky-50 px-5 py-4 text-slate-700">
      {props.children}
    </blockquote>
  );
}

function MarkdownImage(props: any) {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <img
        src={props.src}
        alt={props.alt || ""}
        className="w-full"
        loading="lazy"
      />
      {props.alt ? (
        <figcaption className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
          {props.alt}
        </figcaption>
      ) : null}
    </figure>
  );
}

function MarkdownTable(props: any) {
  return (
    <div className="my-6 w-full overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full border-collapse text-sm">
        {props.children}
      </table>
    </div>
  );
}

function MarkdownTableCell(props: any) {
  return (
    <td className="border-t border-slate-200 px-4 py-2 text-slate-600">
      {props.children}
    </td>
  );
}

function MarkdownTableRow(props: any) {
  return (
    <tr className="even:bg-slate-50">
      {props.children}
    </tr>
  );
}

function MarkdownTableBody(props: any) {
  return <tbody>{props.children}</tbody>;
}

function MarkdownTableHead(props: any) {
  return (
    <thead className="bg-slate-100">
      {props.children}
    </thead>
  );
}

function MarkdownHeaderCell(props: any) {
  return (
    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
      {props.children}
    </th>
  );
}

const components = {
  h1: (props: any) => <MarkdownHeading level={1} {...props} />,
  h2: (props: any) => <MarkdownHeading level={2} {...props} />,
  h3: (props: any) => <MarkdownHeading level={3} {...props} />,
  h4: (props: any) => <MarkdownHeading level={4} {...props} />,
  h5: (props: any) => <MarkdownHeading level={5} {...props} />,
  h6: (props: any) => <MarkdownHeading level={6} {...props} />,
  p: MarkdownParagraph,
  a: MarkdownLink,
  li: MarkdownListItem,
  blockquote: MarkdownBlockquote,
  pre: MarkdownPre,
  code: MarkdownCode,
  img: MarkdownImage,
  table: MarkdownTable,
  thead: MarkdownTableHead,
  tbody: MarkdownTableBody,
  tr: MarkdownTableRow,
  td: MarkdownTableCell,
  th: MarkdownHeaderCell,
};

export default function Markdown(props: MarkdownProps) {
  return <ReactMarkdown components={components} {...props} />;
}
