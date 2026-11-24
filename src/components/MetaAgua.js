
export default function MetaAgua(peso) {
    if (!peso || peso <= 0) return 0;
    return Math.round(peso * 35);
}