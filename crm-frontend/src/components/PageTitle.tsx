import { useEffect } from "react";

const PageTitle = ({ title }: { title: string}) => {
    useEffect(()=>{
        document.title = `${title} | Beinpark`;
    }, [title])
    return <></>
}

export default PageTitle