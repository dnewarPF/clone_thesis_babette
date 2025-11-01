import { useEffect, useState, useMemo } from "react";
import { loadMovies } from "../services/movies";

export default function useMovies() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    loadMovies()
      .then((list) => {
        if (!mounted) return;
        setData(list);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load movies_dataset_480.json");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const grouped = useMemo(() => {
    if (!data) return null;
    return data.reduce((acc, m) => {
      (acc[m.genre] ||= []).push(m);
      return acc;
    }, {});
  }, [data]);

  return { movies: data, grouped, error, loading: !data && !error };
}
