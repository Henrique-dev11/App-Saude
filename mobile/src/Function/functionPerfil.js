export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function parseWeight(value) {
    const text = String(value ?? '').trim().replace(',', '.');
    return /^\d+(\.\d+)?$/.test(text) ? Number(text) : NaN;
}

export function normalizeHealthProfile({ weight, age, bloodType }) {
    const parsedWeight = parseWeight(weight);
    const ageText = String(age ?? '').trim();
    const parsedAge = Number(ageText);
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
        throw new Error('Informe um peso válido em kg, maior que zero.');
    }
    if (!/^\d+$/.test(ageText) || !Number.isInteger(parsedAge) || parsedAge > 130) {
        throw new Error('Informe uma idade inteira entre 0 e 130 anos.');
    }
    if (!BLOOD_TYPES.includes(bloodType)) {
        throw new Error('Selecione seu tipo sanguíneo.');
    }
    return { weight: parsedWeight, age: parsedAge, bloodType };
}

export function mergeProfile(current, changes) {
    const merged = { ...current, ...changes };
    const name = merged.name?.trim();
    if (!name) throw new Error('Informe seu nome.');
    return { ...merged, name, ...normalizeHealthProfile(merged) };
}
