export const preventDefault = (e: any) => {
  if (e && typeof e === "object" && !Array.isArray(e)) e.preventDefault();
};
