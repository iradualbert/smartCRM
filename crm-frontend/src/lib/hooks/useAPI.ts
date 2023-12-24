import axios from "axios";
import { useState, useEffect } from "react";

export const useApiListView = (url: string, params = {}) => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [next, setNext] = useState(url);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [_params, setParams] = useState(params);
  const moreAvailable = next ? true : false;

  useEffect(() => {
    if (hasLoaded) {
      loadData();
    }
  }, [url]);

  useEffect(() => {
    if (hasLoaded) {
      loadData(true);
    }
  }, [_params]);

  const loadData = async (reload = false) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${url}`, {
        params: _params
      });
      setIsLoading(false);
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
    } finally{
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
    results,
    isLoading,
    error,
    moreAvailable,
    init,
    loadMore,
    setParams,
  };
};
