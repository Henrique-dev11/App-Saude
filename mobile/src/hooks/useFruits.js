import { useEffect, useState } from 'react';
import { getFruits } from '../services/fruits';
import { fruitDisplayName } from '../Function/functionFruta';

export default function useFruits() {
    const [fruits, setFruits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [request, setRequest] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');
        getFruits({ signal: controller.signal })
            .then(data => {
                if (!controller.signal.aborted) {
                    setFruits([...data].sort((a, b) =>
                        fruitDisplayName(a.name).localeCompare(fruitDisplayName(b.name), 'pt-BR')));
                }
            })
            .catch(err => { if (!controller.signal.aborted) setError(err.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [request]);

    return { fruits, loading, error, reload: () => setRequest(value => value + 1) };
}
