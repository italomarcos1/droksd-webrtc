const emptyFieldRegex = new RegExp(/^(?=\w+).*$/);

export const isNotEmpty = (value: string) => emptyFieldRegex.test(value) && value !== '';
export const isEmpty = (value: string) => !isNotEmpty(value);


