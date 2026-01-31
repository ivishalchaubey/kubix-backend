import { config } from "../config/env.js";
import logger from "./logger.js";

interface Fast2SMSResponse {
  return: boolean;
  request_id: string;
  message: string[];
}

class SMSService {
  private apiKey: string;
  private senderId: string;
  private messageId: string;
  private baseUrl = "https://www.fast2sms.com/dev/bulkV2";

  constructor() {
    this.apiKey = config.fast2sms.apiKey;
    this.senderId = config.fast2sms.senderId;
    this.messageId = config.fast2sms.messageId;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    if (!this.isAvailable()) {
      logger.error("Fast2SMS API key is not configured");
      return false;
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: this.apiKey,
        },
        body: JSON.stringify({
          route: "dlt",
          sender_id: this.senderId,
          message: this.messageId,
          variables_values: otp,
          flash: 0,
          numbers: phoneNumber,
        }),
      });

      const data = (await response.json()) as Fast2SMSResponse;

      if (data.return) {
        logger.info(
          `SMS OTP sent to ${phoneNumber}, request_id: ${data.request_id}`,
        );
        return true;
      }

      logger.error(`Fast2SMS error: ${JSON.stringify(data.message)}`);
      return false;
    } catch (error) {
      logger.error("Fast2SMS request failed:", error);
      return false;
    }
  }
}

const smsService = new SMSService();
export { SMSService };
export default smsService;
