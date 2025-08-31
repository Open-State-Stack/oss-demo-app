import axios from "axios";

export const axiosPublicInstance = axios.create({
  baseURL: "http://localhost:3001/api",
});

export const axiosInstance = axios.create({
  baseURL: "http://localhost:3001/api",
});

// 401 - UnAuthorised
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      // await rotateRefreshToken();
    }
    return Promise.reject(error);
  }
);

const checkJwtExpiration = () => {
  const token = localStorage.getItem("token");

  if (!token) return;
  const expiry = JSON.parse(atob(token.split(".")[1]));
  const now = new Date();
  const expirationDate = new Date(expiry.exp * 1000);
  const timeDifference = expirationDate.getTime() - now.getTime();
  // Convert the time difference to minutes
  const timeDifferenceMinutes = timeDifference / 1000 / 60;

  // Check if the time difference is less than 3 minutes
  return timeDifferenceMinutes < 3;
};

let isTokenRotated = false;

axiosInstance.interceptors.request.use(
  async (request: any) => {
    const token = localStorage.getItem("token");
    if (!request.url.includes("/logout")) {
      if (!isTokenRotated && checkJwtExpiration()) {
        try {
          isTokenRotated = true;
          // await rotateRefreshToken();
          isTokenRotated = false;
        } catch (error) {
          console.log(error);
        }
      }
    }
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => error
);
