import ReactMarkdown from 'react-markdown';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import {TableHead, TableRow, TableCell, TableBody} from "@mui/material";



function MarkdownParagraph(props: any) {
    return <Typography>{props.children}</Typography>
}

const MarkdownHeading = (props: any) => {
    let variant;
    switch (props.level) {
        case 1:
            variant = "h5";
            break;
        case 2:
            variant = "h6";
            break;
        case 3:
            variant = "subtitle1";
            break;
        case 4:
            variant = "subtitle2";
            break;
        default:
            variant = "h6";
            break;
    }
    return <Typography  gutterBottom variant={variant} >{props.children}</Typography>
};

const MarkdownListItem =(props : any) => {
    return (
        <li>
            <Typography component="span">{props.children}</Typography>
        </li>
    );
    };

function MarkdownTable(props: any) {
    return (
        <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">{props.children}</Table>
        </TableContainer>
    );
}

function MarkdownTableCell(props: any) {
    return <TableCell><Typography>{props.children}</Typography></TableCell>
}

function MarkdownTableRow(props: any) {
    return <TableRow>{props.children}</TableRow>
}

function MarkdownTableBody(props: any) {
    return <TableBody>{props.children}</TableBody>
}

function MarkdownTableHead(props: any) {
    return <TableHead>{props.children}</TableHead>
}

const renderers = {

    heading: MarkdownHeading,
    paragraph: MarkdownParagraph,
    link: Link,
    listItem: MarkdownListItem,
    table: MarkdownTable,
    tableHead: MarkdownTableHead,
    tableBody: MarkdownTableBody,
    tableRow: MarkdownTableRow,
    tableCell: MarkdownTableCell,
};

export default function Markdown(props: any) {
    return <ReactMarkdown className='flex flex-col gap-4' renderers={renderers} {...props} />;
}