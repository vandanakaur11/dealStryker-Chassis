export const getNextSlideIndex = (
  current,
  direction,
  mobileQueryMatches,
  count
) => {
  const step = mobileQueryMatches.small ? 2 : mobileQueryMatches.medium ? 2 : 4;
  if (direction === "next") {
    const calcNext = current + step;
    if (calcNext === count) return 0;
    if (calcNext > count - step) return count - step;
    return calcNext;
  } else {
    const calcPrev = current - step;
    if (calcPrev === -step) return count - step;
    if (calcPrev < 0) return 0;
    return calcPrev;
  }
};
