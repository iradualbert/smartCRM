import React from "react";
import ReactMarkdown from "react-markdown";

type MarkdownProps = React.ComponentProps<typeof ReactMarkdown>;

function MarkdownParagraph(props: any) {
  return <p className="leading-7 [&:not(:first-child)]:mt-4">{props.children}</p>;
}

const MarkdownHeading = (props: any) => {
  const { level, children } = props;

  switch (level) {
    case 1:
      return <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">{children}</h1>;
    case 2:
      return <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">{children}</h2>;
    case 3:
      return <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">{children}</h3>;
    case 4:
      return <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{children}</h4>;
    default:
      return <h5 className="text-lg font-semibold tracking-tight">{children}</h5>;
  }
};

const MarkdownLink = (props: any) => {
  return (
    <a
      href={props.href}
      className="font-medium text-primary underline underline-offset-4"
      target="_blank"
      rel="noreferrer"
    >
      {props.children}
    </a>
  );
};

const MarkdownListItem = (props: any) => {
  return <li className="ml-6 list-disc">{props.children}</li>;
};

function MarkdownTable(props: any) {
  return (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full border-collapse border border-border text-sm">
        {props.children}
      </table>
    </div>
  );
}

function MarkdownTableCell(props: any) {
  return <td className="border border-border px-4 py-2 align-top">{props.children}</td>;
}

function MarkdownTableRow(props: any) {
  return <tr className="even:bg-muted/50">{props.children}</tr>;
}

function MarkdownTableBody(props: any) {
  return <tbody>{props.children}</tbody>;
}

function MarkdownTableHead(props: any) {
  return <thead className="bg-muted/50">{props.children}</thead>;
}

function MarkdownHeaderCell(props: any) {
  return <th className="border border-border px-4 py-2 text-left font-medium">{props.children}</th>;
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
  table: MarkdownTable,
  thead: MarkdownTableHead,
  tbody: MarkdownTableBody,
  tr: MarkdownTableRow,
  td: MarkdownTableCell,
  th: MarkdownHeaderCell,
};

export default function Markdown(props: MarkdownProps) {
  return (
    <ReactMarkdown
      components={components}
      {...props}
    />
  );
}