import type { FormEvent, FormInput, FormFieldValue, FormValues, PathToFields, PathValue, Path } from "./types";

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function getIn<T extends FormValues, P extends Path<T>>(
    obj: T,
    path: P,
): PathValue<T, P> {
    let current: any = obj

    for (const key of path.split('.')) {
        current = current[key]
    }

    return current as PathValue<T, P>
}


export function setIn<
    T extends FormValues,
    P extends Path<T>,
    V extends PathValue<T, P>
>(
    obj: T,
    path: P,
    value: V,
): T {
    const segments = path.split('.')

    const set = (
        current: FormValues | FormValues[],
        index: number,
    ): FormValues | FormValues[] => {
        const key = segments[index]!

        if (Array.isArray(current)) {
            const copy = current.slice();
            const arrayIndex = Number(key);

            copy[arrayIndex] = index === segments.length - 1
                ? value as FormValues
                : set(copy[arrayIndex]!, index + 1) as FormValues;

            return copy;
        }

        if (index === segments.length - 1) {
            return {
                ...current,
                [key]: value,
            } as never
        }

        return {
            ...current,
            [key]: set(current[key] as FormValues, index + 1),
        }
    }

    return set(obj, 0) as T
}

export function extractFromEvent(event: FormEvent): FormFieldValue {
    const target = event.target

    switch (target.type) {
        case 'checkbox':
            return (target as HTMLInputElement).checked;
        case 'number':
        case 'range': {
            return (target as HTMLInputElement).valueAsNumber
        }
        default:
            return target.value
    }
}

export function writeToElement(element: FormInput, value: FormFieldValue): void {
    const normalizedValue = value ?? ""

    switch (element.type) {
        case 'checkbox':
            (element as HTMLInputElement).checked = Boolean(normalizedValue)
            return;
        case 'radio':
            (element as HTMLInputElement).checked = element.value === String(normalizedValue);
            return;
        case 'file':
            return;
        case 'number':
        case 'range':
            element.value = Number.isNaN(value) ? "" : String(value)
            return
    }

    element.value = String(normalizedValue)
}

export function readFromElement(element: FormInput): FormFieldValue | undefined {
    switch (element.type) {
        case 'checkbox':
            return (element as HTMLInputElement).checked
        case 'radio':
            return (element as HTMLInputElement).checked ? element.value : undefined
        case 'file':
        case 'select-multiple':
            return ""
        case 'number':
        case 'range':
            return (element as HTMLInputElement).valueAsNumber
        default:
            return element.value
    }
}