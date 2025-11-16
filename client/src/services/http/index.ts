import axios, {
  type AxiosInstance,
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import type { ApiErrorPayload } from "./types";


export class HttpError extends Error {
  status?: number;
  data?: ApiErrorPayload | undefined;
  isNetworkError: boolean;

  constructor(
    message: string,
    options?: {
      status?: number;
      data?: ApiErrorPayload;
      isNetworkError?: boolean;
    }
  ) {
    super(message);
    this.name = "HttpError";
    this.status = options?.status;
    this.data = options?.data;
    this.isNetworkError = Boolean(options?.isNetworkError);
  }
}

class HttpService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
      timeout: 10000,
      withCredentials: false,
    });

    // При желании можно добавить интерсепторы (токен, логирование и т.п.)
    // this.client.interceptors.request.use((config) => {
    //   const token = ...
    //   if (token) config.headers.Authorization = `Bearer ${token}`;
    //   return config;
    // });
  }

  // Базовый обработчик ошибок
  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorPayload>;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;
      const networkError = !axiosError.response;

      let message = "Произошла ошибка при запросе к серверу";

      if (data?.message) {
        message = data.message;
      } else if (networkError) {
        message = "Сервер недоступен. Проверьте подключение к сети.";
      } else if (status) {
        message = `Ошибка ${status}`;
      }

      // Здесь можно вставить показ уведомлений, логирование и т.д.
      // showToast(message);

      throw new HttpError(message, {
        status,
        data,
        isNetworkError: networkError,
      });
    }

    // Некастомная ошибка
    throw new HttpError("Неизвестная ошибка", {
      isNetworkError: false,
    });
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  post<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "POST", url, data: body });
  }

  put<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PUT", url, data: body });
  }

  patch<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PATCH", url, data: body });
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }
}

// Одинаковый инстанс на все приложение
export const http = new HttpService();
