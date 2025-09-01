export const genericError = (error: any) => {
  if (error?.response?.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
  }
};
