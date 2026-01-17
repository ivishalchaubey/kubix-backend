/**
 * Kylas CRM HTTP Client
 *
 * Singleton axios client with:
 * - Rate limiting (429 handling with exponential backoff)
 * - Request/response interceptors
 * - Automatic retry logic
 * - Error normalization
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import KylasConfig from "../config/KylasConfig.js";
import logger from "../../../utils/logger.js";

// Normalize Kylas API errors
export interface KylasApiErrorDetails {
  status: number;
  message: string;
  data?: any;
  isRateLimit: boolean;
  isValidationError: boolean;
}

class KylasClient {
  private static instance: KylasClient | null = null;
  private client: AxiosInstance;
  private enabled: boolean;

  private constructor() {
    this.enabled = !!KylasConfig.API_KEY;

    if (!this.enabled) {
      logger.warn(
        "Kylas CRM integration is disabled - KYLAS_API_KEY not configured"
      );
    }

    this.client = axios.create({
      baseURL: KylasConfig.BASE_URL,
      timeout: KylasConfig.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        "api-key": KylasConfig.API_KEY,
      },
    });

    this.setupInterceptors();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): KylasClient {
    if (!KylasClient.instance) {
      KylasClient.instance = new KylasClient();
    }
    return KylasClient.instance;
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - silent logging
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config;
      },
      (error: AxiosError) => {
        logger.error("Kylas API Request Error:", error.message);
        return Promise.reject(error);
      }
    );

    // Response interceptor - error normalization
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        const normalizedError = this.normalizeError(error);

        // Suppress expected errors (field validation, rate limits in retry)
        if (
          !normalizedError.isValidationError &&
          !normalizedError.isRateLimit
        ) {
          logger.error("Kylas API Error:", {
            status: normalizedError.status,
            message: normalizedError.message,
            url: error.config?.url,
          });
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Normalize API error response
   */
  private normalizeError(error: AxiosError): KylasApiErrorDetails {
    const data = error.response?.data as any;
    const errorString = JSON.stringify(data || {});

    return {
      status: error.response?.status || 0,
      message: data?.message || error.message || "Unknown error",
      data: data,
      isRateLimit: error.response?.status === 429,
      isValidationError:
        error.response?.status === 400 &&
        (errorString.includes("Field is not defined") ||
          errorString.includes("Invalid Mobile Number")),
    };
  }

  /**
   * Check if Kylas integration is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * GET request with retry
   */
  public async get<T>(url: string, retryCount = 0): Promise<T> {
    if (!this.enabled) throw new Error("Kylas CRM is disabled");

    try {
      const response = await this.client.get<T>(url);
      return response.data;
    } catch (error: any) {
      if (
        error.response?.status === 429 &&
        retryCount < KylasConfig.MAX_RETRIES
      ) {
        await this.delay((retryCount + 1) * KylasConfig.RETRY_DELAY);
        return this.get<T>(url, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * POST request with retry
   */
  public async post<T>(url: string, data: any, retryCount = 0): Promise<T> {
    if (!this.enabled) throw new Error("Kylas CRM is disabled");

    try {
      const response = await this.client.post<T>(url, data);
      return response.data;
    } catch (error: any) {
      if (
        error.response?.status === 429 &&
        retryCount < KylasConfig.MAX_RETRIES
      ) {
        await this.delay((retryCount + 1) * KylasConfig.RETRY_DELAY);
        return this.post<T>(url, data, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * PATCH request with retry (for JSON Patch)
   */
  public async patch(
    url: string,
    patchOperations: any[],
    retryCount = 0
  ): Promise<void> {
    if (!this.enabled) throw new Error("Kylas CRM is disabled");

    try {
      await this.client.patch(url, patchOperations, {
        headers: {
          "Content-Type": "application/json-patch+json",
        },
      });
    } catch (error: any) {
      if (
        error.response?.status === 429 &&
        retryCount < KylasConfig.MAX_RETRIES
      ) {
        await this.delay((retryCount + 1) * KylasConfig.RETRY_DELAY);
        return this.patch(url, patchOperations, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * PUT request with retry
   */
  public async put<T>(url: string, data: any, retryCount = 0): Promise<T> {
    if (!this.enabled) throw new Error("Kylas CRM is disabled");

    try {
      const response = await this.client.put<T>(url, data);
      return response.data;
    } catch (error: any) {
      if (
        error.response?.status === 429 &&
        retryCount < KylasConfig.MAX_RETRIES
      ) {
        await this.delay((retryCount + 1) * KylasConfig.RETRY_DELAY);
        return this.put<T>(url, data, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default KylasClient;
