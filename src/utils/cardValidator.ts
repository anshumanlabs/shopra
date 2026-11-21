export interface CardValidationResult {
    valid: boolean;
    errors: string[];
}

export function validateCardNumber(number: string): boolean {
    const digits = number.replace(/\D/g, "");

    if (!/^\d{13,19}$/.test(digits)) return false;

    let sum = 0;
    let doubleDigit = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = Number(digits[i]);

        if (doubleDigit) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        doubleDigit = !doubleDigit;
    }

    return sum % 10 === 0;
}

export function validateExpiry(expiry: string): boolean {
    const match = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);

    if (!match) return false;

    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return (
        year > currentYear ||
        (year === currentYear && month >= currentMonth)
    );
}

export function validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
}

export function validateCard(
    number: string,
    expiry: string,
    cvv: string
): CardValidationResult {
    const errors: string[] = [];

    if (!validateCardNumber(number)) {
        errors.push("Invalid card number.");
    }

    if (!validateExpiry(expiry)) {
        errors.push("Invalid or expired card.");
    }

    if (!validateCVV(cvv)) {
        errors.push("CVV must contain 3 or 4 digits.");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
