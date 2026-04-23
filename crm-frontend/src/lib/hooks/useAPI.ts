import axios from "axios";
import { useState, useEffect } from "react";

type ApiListParams = Record<string, unknown> & {
    limit?: number
}

export const useApiListView = (url: string, params: ApiListParams = {}) => {
    const [count, setCount] = useState(0);
    const [results, setResults] = useState<object[]>([]);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [next, setNext] = useState(url);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [_params, setParams] = useState<ApiListParams>(params);
    const moreAvailable = next ? true : false;

    useEffect(() => {
        if (hasLoaded) {
            loadData();
        }
    }, [url]);

    useEffect(() => {
        // if (hasLoaded) {
        //   loadData(true);
        // }
        //console.log(params)
        if (_params.limit) loadData(true);
    }, [_params]);

    const updateItem = async ({ id, urlWithId, data }: { id: number | string, urlWithId: string, data: object }) => {
        const res = await axios.put<object>(urlWithId, data);
        setResults((prevResults) =>
            prevResults.map((element: any) =>
                element.id === id ? res.data : element
            )
        );
    }

    const deleteItem = async ({ id, urlWithId }:{id: number | string, urlWithId: string,}) => {
        await axios.delete(urlWithId)
        setCount(prevCount => prevCount - 1);
        setResults(prevResults => prevResults.filter((element: any) => element.id !== id))

    }

    const loadData = async (reload = false) => {
        setIsLoading(true);
        try {
            const _url = hasLoaded ? next : url;
            let data: { count: number; results: object[]; next: string | null }

            if (hasLoaded) {
                data = (await axios.get(next)).data;
            }
            else {
                data = (await axios.get(`${_url}`, {
                    params: _params
                })).data
            }
            setIsLoading(false);
            setCount(data.count);
            if (reload) {
                setResults(data.results);
            } else {
                setResults((prev) => [...prev, ...data.results]);
            }
            setNext(data.next);
        } catch (err) {
            setError(true);

            // TO BE FALSE
            // setHasLoaded(true);
        } finally {
            setIsLoading(false);
            setHasLoaded(true);
        }
    };

    const init = () => {
        if (hasLoaded) return;
        loadData();
    };

    const loadMore = () => {
        if (next) {
            loadData();
        }
    };
    return {
        count,
        results,
        isLoading,
        error,
        moreAvailable,
        init,
        loadMore,
        setParams,
        deleteItem,
        updateItem,
    };
};
