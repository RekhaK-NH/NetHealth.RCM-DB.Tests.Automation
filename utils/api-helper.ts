/**
 * API Helper utilities for making HTTP requests
 */

export class ApiHelper {
  /**
   * Parse JSON response safely
   */
  static async parseJsonResponse(response: any) {
    try {
      return await response.json();
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      return null;
    }
  }

  /**
   * Build query string from object
   */
  static buildQueryString(params: Record<string, any>): string {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
    return query.toString();
  }

  /**
   * Validate response status
   */
  static validateStatus(response: any, expectedStatus: number): boolean {
    return response.status() === expectedStatus;
  }

  /**
   * Extract error message from response
   */
  static async getErrorMessage(response: any): Promise<string> {
    try {
      const body = await response.json();
      return body.message || body.error || 'Unknown error';
    } catch {
      return response.statusText();
    }
  }
}
