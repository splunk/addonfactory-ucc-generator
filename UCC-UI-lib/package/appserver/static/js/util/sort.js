export const sortAlphabetical = (a, b, sort_dir) => {
    a = a ? a : '',
    b = b ? b : '';
    const res = (a < b) ? -1 : (a > b) ? 1 : 0;
    return sort_dir === 'asc' ? res : -res;
};

export const sortNumerical = (a, b, sort_dir) => {
    a = a ? a : 0,
    b = b ? b : 0;
    const res = (a < b) ? -1 : (a > b) ? 1 : 0;
    return sort_dir === 'asc' ? res : -res;
};
