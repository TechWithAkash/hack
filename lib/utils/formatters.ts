export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

export function formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export function formatArea(km2: number): string {
    if (km2 >= 1000) return `${(km2 / 1000).toFixed(1)}k km²`;
    return `${km2.toFixed(1)} km²`;
}

export function formatPopulation(pop: number): string {
    if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(2)}M`;
    if (pop >= 1_000) return `${(pop / 1_000).toFixed(1)}K`;
    return String(pop);
}

export function formatScore(score: number): string {
    return score.toFixed(1);
}
