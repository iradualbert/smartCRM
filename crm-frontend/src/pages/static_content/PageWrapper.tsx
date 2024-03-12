import { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import Markdown from "./Markdown";
import { Typography } from "@mui/material";


type PageWrapperProps = {
    md: string,
    pageTitle: string
}

const PageWrapper = ({ md, pageTitle }: PageWrapperProps) => {
    const [content, setContent] = useState("");

    useEffect(() => {
        fetch(md).then((res) => res.text() ).then(setContent)
    }, [md])

    return (
        <div className="flex flex-col py-10 w-full items-center mt-14">
            <PageTitle title={pageTitle} />
            <Typography variant="h4" component="h1" borderBottom={4} marginBottom={10}>{pageTitle}</Typography>
            <main style={{ maxWidth: 1000 }}>
                <Markdown>{content}</Markdown>
            </main>
        </div>
    )
}

export default PageWrapper;

